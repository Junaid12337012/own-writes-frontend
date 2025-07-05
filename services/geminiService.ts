
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AiContentSuggestion, GeneratedImage, OutlineItem, AiFirstDraft, Comment, WebSearchResult, GroundingChunk } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL } from '../constants';

// Initialize the Gemini client
// The API key is managed by the environment and assumed to be available as process.env.API_KEY
let ai: GoogleGenAI;
try {
  // The API key MUST be obtained exclusively from the environment variable `process.env.API_KEY`
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (e) {
    console.error("Failed to initialize GoogleGenAI. Make sure API_KEY is set in your environment.", e);
}

const parseJsonFromText = (text: string): any => {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Original text:", text);
        throw new Error("Invalid JSON response from AI.");
    }
};

const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, ' ').trim();
};


export const geminiService = {
    improveWriting: async (text: string): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `You are an expert editor. Review the following text and improve it for clarity, grammar, flow, and impact, while preserving the original meaning. Return only the improved text, with no commentary or quotation marks.\n\nOriginal text: "${text}"\n\nImproved text:`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { temperature: 0.5 }});
        return response.text.trim();
    },
    
    changeTone: async (text: string, tone: 'professional' | 'casual' | 'witty' | 'confident'): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `You are a master of tone. Rewrite the following text in a ${tone} tone. Keep the core message intact. Return only the rewritten text, with no commentary or quotation marks.\n\nOriginal text: "${text}"\n\nRewritten text in a ${tone} tone:`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { temperature: 0.8 } });
        return response.text.trim();
    },

    summarizeSelection: async (text: string): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Summarize the following text into one or two concise sentences. Capture the main point effectively. Return only the summary text, with no commentary.\n\nOriginal text: "${text}"\n\nSummary:`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt });
        return response.text.trim();
    },

    generateFirstDraft: async (topic: string): Promise<AiFirstDraft> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Generate a complete blog post draft based on the topic: "${topic}".
The response must be a single, valid JSON object with two keys: "title" and "content".
- The "title" should be a creative and engaging blog post title.
- The "content" should be well-structured HTML for a blog post. It must include an introductory paragraph, at least two main sections using <h2> tags, with each section containing paragraphs (<p>) and potentially sub-headings (<h3>) or unordered lists (<ul><li>...</li></ul>). Conclude with a summary paragraph.
Ensure the HTML is clean and ready for direct insertion into a content editor.
Do not include <html>, <head>, or <body> tags.`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json", temperature: 0.7 } });
        return parseJsonFromText(response.text);
    },
  
    generateMetaDescription: async (title: string, htmlContent: string): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const plainTextContent = stripHtml(htmlContent).substring(0, 1500);
        const prompt = `Based on the following blog post title and content, generate a concise, SEO-friendly meta description. The description should be a single, compelling sentence or two, around 150-160 characters long. It should accurately summarize the content and entice users to click.\nTitle: "${title}"\nContent: "${plainTextContent}"\nReturn only the meta description text, with no extra formatting or labels.`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt });
        return response.text.replace(/"/g, "").trim();
    },

    getContentSuggestions: async (promptText: string, currentHtmlContent: string): Promise<AiContentSuggestion[]> => {
        if (!ai) throw new Error("AI service not initialized.");
        const plainContent = stripHtml(currentHtmlContent).substring(0, 500);
        const fullPrompt = `Provide 3 brief content suggestions or continuations based on the blog title/topic: "${promptText}" and optionally the existing content snippet: "${plainContent}". Each suggestion should be a single sentence or a short phrase, suitable for direct insertion as a new paragraph or idea. Format as a JSON array of strings.\nSuggestions:`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: fullPrompt, config: { responseMimeType: "application/json", temperature: 0.7 }});
        const suggestions: string[] = parseJsonFromText(response.text);
        return suggestions.map(s => ({ suggestion: s }));
    },

    generateFeaturedImage: async (textPrompt: string): Promise<GeneratedImage | null> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Generate a visually appealing, high-quality featured image for a blog post. Theme/content: "${textPrompt}". Style: cinematic, detailed, suitable for a blog header. Avoid text unless explicitly part of the theme.`;
        try {
            const response = await ai.models.generateImages({ model: GEMINI_IMAGE_MODEL, prompt, config: { numberOfImages: 1, outputMimeType: "image/jpeg" }});
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64Image = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
                return { base64Image, promptUsed: textPrompt };
            }
            return null;
        } catch (error) {
            console.error("Error generating featured image:", error);
            return null;
        }
    },
  
    summarizeText: async (htmlText: string): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const plainText = stripHtml(htmlText);
        const prompt = `Summarize the following text concisely for a blog excerpt: "${plainText}"`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt });
        return response.text;
    },

    getRelatedTopics: async (htmlText: string): Promise<string[]> => {
        if (!ai) throw new Error("AI service not initialized.");
        const plainText = stripHtml(htmlText);
        const prompt = `Based on the following text, suggest 3-5 related topics or keywords. Return as a JSON array of strings: "${plainText}"`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json" } });
        return parseJsonFromText(response.text);
    },

    generateBlogPostIdeas: async (topic: string): Promise<string[]> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Generate 5 creative blog post titles or brief ideas based on the following topic or keywords. Each idea should be concise and engaging. Return as a JSON array of strings: "${topic}"`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json", temperature: 0.8 } });
        return parseJsonFromText(response.text);
    },

    generatePostOutline: async (topic: string): Promise<OutlineItem[]> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Generate a structured blog post outline for the topic: "${topic}".
The outline should include main sections (as 'h2'), potential sub-sections (as 'h3' or 'h4'), and key bullet points (as 'point') under them.
Return the outline as a JSON array of objects. Each object must have a 'type' (string: 'h2', 'h3', 'h4', or 'point') and a 'text' (string) property.
Nested items should be in a 'children' array of similar objects. Ensure the entire response is a single valid JSON array.`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { responseMimeType: "application/json", temperature: 0.5 } });
        const outline = parseJsonFromText(response.text) as OutlineItem[];
        if (!Array.isArray(outline) || (outline.length > 0 && (typeof outline[0].type !== "string" || typeof outline[0].text !== "string"))) {
            throw new Error("AI returned an invalid outline structure.");
        }
        return outline;
    },

    askTheWeb: async (prompt: string): Promise<WebSearchResult> => {
        if (!ai) throw new Error("AI service not initialized.");
        const response: GenerateContentResponse = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { tools: [{ googleSearch: {} }] } });
        const answer = response.text;
        const sources = (response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
            .filter((chunk): chunk is GroundingChunk => !!chunk.web?.uri)
            .map((chunk) => ({ web: { uri: chunk.web!.uri!, title: chunk.web!.title || chunk.web!.uri! } }));
        return { answer, sources };
    },

    generateTextShotImage: async (selectedText: string): Promise<GeneratedImage | null> => {
        if (!ai) throw new Error("AI service not initialized.");
        const prompt = `Create a visually appealing image with the following text prominently and beautifully displayed on it: "${selectedText}". The style should be modern, elegant, and highly shareable, suitable for social media quote cards. Emphasize clarity and readability of the text. Aspect ratio can be 1:1 or 16:9. No additional text other than the quote itself.`;
        const response = await ai.models.generateImages({ model: GEMINI_IMAGE_MODEL, prompt, config: { numberOfImages: 1, outputMimeType: "image/jpeg" }});
        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64Image = `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
            return { base64Image, promptUsed: selectedText };
        }
        return null;
    },
  
    summarizeComments: async (comments: Comment[]): Promise<string> => {
        if (!ai) throw new Error("AI service not initialized.");
        const commentTexts = comments.flatMap((c) => {
            const parentComment = `User "${c.userName}" said: ${stripHtml(c.content)}`;
            const replyComments = c.replies ? c.replies.map((r) => `In reply, User "${r.userName}" said: ${stripHtml(r.content)}`) : [];
            return [parentComment, ...replyComments];
        });
        if (commentTexts.length === 0) return "There are no comments to summarize.";
        const prompt = `You are an expert at analyzing discussions. Below is a list of comments from a blog post. Please summarize the key themes, main points of agreement or disagreement, and the overall sentiment of the discussion. Provide the summary as a few concise bullet points. Start each bullet point with a '*'.\n\nComments:\n---\n${commentTexts.join("\n---\n")}\n---\n\nSummary:`;
        const response = await ai.models.generateContent({ model: GEMINI_TEXT_MODEL, contents: prompt, config: { temperature: 0.3 } });
        return response.text.trim();
    },

};
