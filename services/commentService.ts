import axios from './axios';

export async function fetchComments(blogId: string) {
  const res = await axios.get(`/comments/blog/${blogId}`);
  // Normalize each comment to ensure it has an `id` field (backend returns `_id`)
  const normalized = res.data.comments.map((c: any) => ({ ...c, id: c.id || c._id }));
  return normalized;
}

export async function postComment(blogId: string, content: string, parentId?: string | null) {
  const payload: any = { blog: blogId, content };
  if (parentId) payload.parentId = parentId;
  const res = await axios.post('/comments', payload);
  // Normalize the returned comment to ensure it has an `id` field (backend returns `_id`)
  const normalized = { ...res.data.comment, id: res.data.comment.id || res.data.comment._id };
  return normalized;
}

export async function reportComment(commentId: string, reporterId: string) {
  const res = await axios.post(`/comments/report/${commentId}`, { reporterId });
  return res.data;
}
