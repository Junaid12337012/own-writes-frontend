import axios from './axios';

export async function fetchComments(blogId: string) {
  const res = await axios.get(`/comments/blog/${blogId}`);
  return res.data.comments;
}

export async function postComment(blogId: string, content: string, parentId?: string | null) {
  const payload: any = { blog: blogId, content };
  if (parentId) payload.parentId = parentId;
  const res = await axios.post('/comments', payload);
  return res.data.comment;
}
