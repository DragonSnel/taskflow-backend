import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/tasks";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке задач:", error);
    }
  };

  const addTask = async () => {
    if (!title || !description) {
      alert("Введите название и описание!");
      return;
    }
    try {
      const response = await axios.post(API_URL, { title, description });
      setTasks([...tasks, response.data]);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Ошибка при добавлении задачи:", error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить задачу?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchTasks();
      } catch (error) {
        console.error("Ошибка при удалении задачи:", error);
      }
    }
  };

  return (
    <div className="container">
      <h2>📋 Task Manager</h2>

      <div className="input-group">
        <input type="text" placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button onClick={addTask}>➕ Добавить</button>
      </div>

      <h3>Активные задачи</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>
                <button onClick={() => deleteTask(task.id)}>🗑 Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
