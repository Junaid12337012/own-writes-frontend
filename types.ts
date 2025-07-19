
export const UserRole = {
  USER: 'user',
  EDITOR: 'editor',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  bio?: string;
  profilePictureUrl?: string; // URL to profile picture
  following?: string[]; // Array of author IDs the user is following
  createdAt?: string; // ISO Date string for analytics
}

export const ReactionTypes = {
    like: '👍',
    love: '❤️',
    insightful: '💡',
    celebrate: '🎉',
} as const;

export type ReactionType = keyof typeof ReactionTypes;

export interface BlogMedia {
  type: 'image' | 'video';
  url: string;
  altText?: string;
}

export type PostType = 'article' | 'blog' | 'podcast';

export interface BlogPost {
  id: string;
  title: string;
  content: string; // Rich text or Markdown
  excerpt?: string;
  metaDescription?: string; // For SEO
  featuredImage?: string; // URL to image or base64 string
  tags: string[]; // Explicitly an array of strings
  authorId: string;
  authorName: string; // Denormalized for easier display
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  publishedAt?: string; // ISO Date string, if published
  status: 'draft' | 'published' | 'scheduled';
  postType?: PostType;
  audioUrl?: string; // For podcast posts
  scheduledPublishTime?: string; // ISO Date string
  reactions: Partial<Record<ReactionType, string[]>>; // Replaces 'likes'. Maps reaction type to an array of user IDs
  commentCount?: number; // Number of comments, for dashboard display
  matchSnippet?: string; // For search results, a snippet of content where the match occurred
  matchField?: 'title' | 'content' | 'author' | 'tag'; // Indicates which field matched the search
}

export interface Comment {
  id: string;
  blogPostId: string;
  userId: string;
  userName: string; // Denormalized
  userProfilePictureUrl?: string; // Denormalized
  content: string;
  createdAt: string; // ISO Date string
  parentId?: string | null; // For replies
  replies?: Comment[]; // Nested replies
  reported?: boolean;
  approved?: boolean;
}

export interface Bookmark {
  userId: string;
  blogPostId: string;
  addedAt: string; // ISO Date string
}

export interface Reaction {
    userId: string;
    postId: string;
    type: ReactionType;
}

export interface Notification {
  id: string;
  recipientId: string;
  actor: {
    id: string;
    username: string;
    profilePictureUrl?: string;
  };
  type: 'reaction' | 'comment' | 'reply' | 'follow' | 'report';
  message: string; // The generated message for display
  link: string; // The URL to navigate to (e.g., #/blog/post-id)
  read: boolean;
  createdAt: string;
}


// For Gemini API
export interface AiContentSuggestion {
  suggestion: string;
}

export interface GeneratedImage {
  base64Image: string; // base64 encoded image data
  promptUsed: string;
}

// AI Generated Outline
export interface OutlineItem {
  type: 'h2' | 'h3' | 'h4' | 'point'; // 'point' for list items or paragraph points
  text: string;
  children?: OutlineItem[]; // For nested points or sub-subheadings
}

export interface AiFirstDraft {
    title: string;
    content: string; // HTML content
}

// Search Grounding types
export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  }
}
export interface WebSearchResult {
    answer: string;
    sources: GroundingChunk[];
}


// Analytics data structures
export interface TotalStats {
  totalUsers: number;
  totalBlogs: number;
  totalComments: number;
  engagementRate: number; // New: average reactions+comments per post
}

export interface TopPostStat {
  postId: string;
  title: string;
  engagementScore: number; // Combined score of reactions and comments
}

export interface TopAuthorStat {
    authorId: string;
    authorName: string;
    profilePictureUrl?: string;
    totalEngagement: number;
}

export interface TimeSeriesDataPoint {
    date: string;
    users: number;
    posts: number;
}


export interface PostAnalyticsData {
    postId: string;
    viewsOverTime: { date: string, views: number }[];
    trafficSources: { source: string, value: number }[];
    engagementScore: {
        score: number;
        breakdown: {
            reactions: number;
            comments: number;
            shares: number; // Mocked
        }
    };
}
