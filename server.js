const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === "true"
});

// Проверяем подключение к БД
pool.connect()
  .then(() => console.log("📡 PostgreSQL подключен!"))
  .catch(err => console.error("❌ Ошибка подключения к БД:", err));

app.get('/', (req, res) => {
  res.send('API работает!');
});

// 📌 Получение всех задач
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(tasks.rows);
  } catch (error) {
    console.error("Ошибка при получении задач:", error);
    res.status(500).json({ error: "Ошибка при получении задач" });
  }
});

// 📌 Добавление задачи
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при добавлении задачи:", error);
    res.status(500).json({ error: "Ошибка при добавлении задачи" });
  }
});

// 📌 Удаление задачи
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: "Задача удалена" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при удалении задачи" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
