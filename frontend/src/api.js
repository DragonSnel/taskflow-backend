import axios from "axios";

const API_URL = "http://localhost:5000";

export const getTasks = async () => {
  const response = await axios.get(`${API_URL}/api/tasks`);
  return response.data;
};

export const createTask = async (task) => {
  const response = await axios.post(`${API_URL}/api/tasks`, task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await axios.put(`${API_URL}/api/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  await axios.delete(`${API_URL}/api/tasks/${id}`);
};
