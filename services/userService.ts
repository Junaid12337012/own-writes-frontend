import axios from './axios';

export async function updateProfile(data: { username?: string; bio?: string; profilePictureUrl?: string }) {
  const res = await axios.put('/users/me', data);
  return res.data.user;
}

export async function getMe() {
  const res = await axios.get('/users/me');
  return res.data.user;
}
