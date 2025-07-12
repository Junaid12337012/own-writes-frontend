import axios from './axios';

export async function signup(username: string, email: string, password: string) {
  const res = await axios.post('/auth/signup', { username, email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await axios.post('/auth/login', { email, password });
  return res.data;
}

export async function googleLogin(idToken: string) {
  const res = await axios.post('/auth/google', { idToken });
  return res.data; // expects { user, token }
}
