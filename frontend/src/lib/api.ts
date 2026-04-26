import axios from "axios";
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api" });
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((res) => res, (err) => {
  if (err.response?.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  }
  return Promise.reject(err);
});
export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => api.post("/auth/register", { name, email, password }),
};
export const projectsApi = {
  getAll: () => api.get("/projects"),
  getById: (id: number) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; status?: string }) => api.post("/projects", data),
  update: (id: number, data: { name: string; description?: string; status?: string }) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};
export const tasksApi = {
  getByProject: (projectId: number) => api.get(`/projects/${projectId}/tasks`),
  create: (projectId: number, data: object) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId: number, taskId: number, data: object) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId: number, taskId: number) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};
export const aiApi = {
  ask: (projectId: number, question: string) =>
    api.post(`/projects/${projectId}/ai/ask`, { question }),
};
export const standupApi = {
  generate: (projectId: number) =>
    api.post(`/projects/${projectId}/ai/standup`),
};
