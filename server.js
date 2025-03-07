const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  ssl: { rejectUnauthorized: false }  // Railway требует SSL
});


// Проверка подключения к базе
pool.connect()
  .then(() => console.log("📡 PostgreSQL подключен!"))
  .catch(err => console.error("❌ Ошибка подключения к БД:", err));

app.get('/', (req, res) => {
  res.send('API работает!');
});

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(400).json({ error: 'Неверные данные' });

    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) return res.status(400).json({ error: 'Неверные данные' });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// Получение всех задач
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await pool.query('SELECT * FROM tasks');
    res.json(tasks.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении задач' });
  }
});

// Добавление новой задачи
app.post('/api/tasks', async (req, res) => {
  const { title, description, user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении задачи' });
  }
});

// Обновление задачи
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *',
      [title, description, status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении задачи' });
  }
});

// Удаление задачи
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Задача удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении задачи' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
