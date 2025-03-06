import { useEffect, useState } from "react";
import { getTasks, createTask, deleteTask } from "../api";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const data = await getTasks();
    setTasks(data);
  };

  const handleAddTask = async () => {
    if (!newTask) return;
    await createTask({ title: newTask, description: "Новая задача", user_id: 1 });
    setNewTask("");
    loadTasks();
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    loadTasks();
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-center">Задачи</h1>
      <div className="flex gap-2 my-4">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Новая задача..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleAddTask}>
          ➕
        </button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="border p-2 flex justify-between items-center">
            {task.title}
            <button className="text-red-500" onClick={() => handleDeleteTask(task.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
