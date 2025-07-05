import axios from './axios';

export async function fetchAnalytics() {
  const res = await axios.get('/admin/analytics');
  return res.data.data;
}

export async function fetchUsers() {
  const res = await axios.get('/admin/users');
  return res.data.users.map((u:any)=>({ ...u, id: u._id }));
}

export async function deleteUser(id: string) {
  const res = await axios.delete(`/admin/users/${id}`);
  return res.data;
}

export async function fetchAllBlogs() {
  const res = await axios.get('/admin/blogs');
  return res.data.blogs.map((b:any)=>({ ...b, id: b._id, authorId: typeof b.author==='string'? b.author: b.author?._id, authorName: typeof b.author==='string'? undefined : b.author?.username }));
}

export async function deleteBlog(id: string) {
  const res = await axios.delete(`/admin/blogs/${id}`);
  return res.data;
}

export async function updateUserRole(id: string, role: string) {
  const res = await axios.put(`/admin/users/${id}/role`, { role });
  return res.data.user;
}

// Comment moderation
export async function fetchPendingComments(){
  const res = await axios.get('/admin/comments/pending');
  return res.data.comments.map((c:any)=>({
    id:c._id,
    userName:c.author?.username,
    content:c.content,
    createdAt:c.createdAt,
    blogPostId:c.blog?._id || c.blog
  }));
}
export async function approveComment(id:string){
  return (await axios.put(`/admin/comments/${id}/approve`)).data.comment;
}
export async function deleteComment(id:string){
  return (await axios.delete(`/admin/comments/${id}`)).data;
}
