import axios from './axios';

export async function fetchCategories() {
  const res = await axios.get('/categories');
  return res.data.categories;
}

export async function createCategory(data: any) {
  const res = await axios.post('/categories', data);
  return res.data.category;
}

export async function updateCategory(id: string, data: any) {
  const res = await axios.put(`/categories/${id}`, data);
  return res.data.category;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`/categories/${id}`);
  return res.data;
}
