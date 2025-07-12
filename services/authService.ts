import axios, { setPassword, clearPassword } from './axios';

export async function signup(username: string, email: string, password: string) {
  const res = await axios.post('/auth/signup', { username, email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await axios.post('/auth/login', { email, password });
  // Set password for subsequent requests
  setPassword(password);
  return res.data;
}

export async function googleLogin(idToken: string) {
  const res = await axios.post('/auth/google', { idToken });
  return res.data;
}

export function logout() {
  clearPassword();
  // Clear any other session data if needed
}
