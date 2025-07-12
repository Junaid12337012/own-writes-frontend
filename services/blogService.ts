import axios from './axios';
import { BlogPost } from '../types';

interface BackendBlog {
  _id: string;
  title: string;
  content: string;
  author: string | { _id: string; username?: string };
  categories?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

function transformBlog(b: BackendBlog): any {
  return {
    ...b,
    id: b._id,
    tags: (b.categories || []).map((c: any) => typeof c === 'string' ? c : c.name || c._id),
    status: b.published ? 'published' : 'draft',
    authorId: typeof b.author === 'string' ? b.author : b.author._id,
  };
}



export async function clearBlogsCache() {
  localStorage.removeItem(BLOG_CACHE_KEY);
  localStorage.removeItem(BLOG_CACHE_TIME_KEY);
export async function fetchBlogs(): Promise<any[]> {
  try {
    const { data } = await axios.get('/api/blogs');
    return data.map(transformBlog);
  } catch (error) {
    console.error('Failed to fetch blogs:', error);
    return [];
}

async function refreshBlogsInBackground() {
  try {
    const res = await axios.get('/blogs', { timeout: 60000 });
    const fresh = res.data.blogs.map((b: BackendBlog) => transformBlog(b));
    writeBlogCache(fresh);
  } catch (err) {
    // Ignore background errors
    console.debug('Background blog refresh failed', err);
  }
}

export async function fetchBlog(id: string) {
  const res = await axios.get(`/blogs/${id}`);
  return transformBlog(res.data.blog);
}

export async function createBlog(data: any) {
  const res = await axios.post('/blogs', data);
  return transformBlog(res.data.blog);
}

export async function updateBlog(id: string, data: any) {
  const res = await axios.put(`/blogs/${id}`, data);
  return transformBlog(res.data.blog);
}

export async function deleteBlog(id: string) {
  const res = await axios.delete(`/blogs/${id}`);
  return res.data;
}

export async function addReaction(id: string, type: string) {
  const res = await axios.post(`/blogs/${id}/reactions`, { type });
  return transformBlog(res.data.blog);
}

// --- Search Blogs ---
export async function searchBlogsFullText(term: string): Promise<BlogPost[]> {
  if (!term.trim()) return [];
  const lowerCaseTerm = term.toLowerCase();

  // Ideally, use backend search endpoint; fallback to client-side for now
  try {
    const res = await axios.get('/blogs/search', { params: { term } });
    // Assume backend returns { blogs: BackendBlog[] }
    if (res.data?.blogs) {
      return res.data.blogs.map((b: any) => transformBlog(b));
    }
  } catch (err) {
    // Ignore error and fallback to client-side filtering
  }

  const blogs: BlogPost[] = await fetchBlogs();

  return blogs
    .map((p): BlogPost | null => {
      let matchSnippet = '';
      let matchField: BlogPost['matchField'] | undefined;

      if ((p.title ?? '').toLowerCase().includes(lowerCaseTerm)) {
        matchField = 'title';
        matchSnippet = p.title;
      } else if ((p.tags || []).some(t => (t ?? '').toLowerCase().includes(lowerCaseTerm))) {
        matchField = 'tag';
        matchSnippet = p.tags.join(', ');
      } else if ((p.authorName ?? '').toLowerCase().includes(lowerCaseTerm)) {
        matchField = 'author';
        matchSnippet = `By ${p.authorName}`;
      } else if ((p.content ?? '').toLowerCase().includes(lowerCaseTerm)) {
        matchField = 'content';
        const plainText = p.content.replace(/<[^>]+>/g, ' ');
        const regex = new RegExp(`.{0,50}${term}.{0,50}`, 'i');
        const match = plainText.match(regex);
        matchSnippet = match ? `...${match[0]}...` : 'Match found in content.';
      }

      if (matchField) {
        return { ...p, matchSnippet, matchField };
      }
      return null;
    })
    .filter((p): p is BlogPost => p !== null);
}
