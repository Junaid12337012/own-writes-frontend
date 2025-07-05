import axios from './axios';

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

export async function fetchBlogs() {
  const res = await axios.get('/blogs');
  return res.data.blogs.map((b: BackendBlog) => transformBlog(b));
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
