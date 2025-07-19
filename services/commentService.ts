import axios from './axios';
import { DEFAULT_PROFILE_PICTURE } from '../constants';

// Build full URL for profile image if backend returns a relative path
const buildProfileUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:|data:)/.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${base}${normalized}`;
};

export async function fetchComments(blogId: string) {
  const res = await axios.get(`/comments/blog/${blogId}`);
  // Normalize each comment to ensure it has an `id` field (backend returns `_id`)
  const normalized = res.data.comments.map((c: any) => ({
    ...c,
    id: c.id || c._id,
    userName: c.userName || c.author?.username || c.user?.username || c.authorName || '',
    userProfilePictureUrl: buildProfileUrl(c.userProfilePictureUrl || c.author?.profilePictureUrl || c.author?.picture || c.user?.profilePictureUrl || c.user?.picture) || DEFAULT_PROFILE_PICTURE,
  }));
  return normalized;
}

export async function postComment(blogId: string, content: string, parentId?: string | null) {
  const payload: any = { blog: blogId, content };
  if (parentId) payload.parentId = parentId;
  const res = await axios.post('/comments', payload);
  // Normalize the returned comment to ensure it has an `id` field (backend returns `_id`)
  const normalized = {
    ...res.data.comment,
    id: res.data.comment.id || res.data.comment._id,
    userName:
      res.data.comment.userName ||
      res.data.comment.author?.username ||
      res.data.comment.user?.username ||
      res.data.comment.authorName ||
      '',
    userProfilePictureUrl: buildProfileUrl(
      res.data.comment.userProfilePictureUrl ||
      res.data.comment.author?.profilePictureUrl ||
      res.data.comment.author?.picture ||
      res.data.comment.user?.profilePictureUrl ||
      res.data.comment.user?.picture
    ) || DEFAULT_PROFILE_PICTURE,
  };
  return normalized;
}

export async function reportComment(commentId: string, reporterId: string) {
  try {
    const res = await axios.post(`/comments/report/${commentId}`, { reporterId });
    return res.data;
  } catch (error) {
    try {
      const res = await axios.post(`/comments/${commentId}/report`, { reporterId });
      return res.data;
    } catch (error) {
      try {
        const res = await axios.post(`/report-comment/${commentId}`, { reporterId });
        return res.data;
      } catch (error) {
        throw error;
      }
    }
  }
}
