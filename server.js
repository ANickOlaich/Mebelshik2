const express = require('express');
const cors = require('cors');
const db = require('./models');
const sequelize = db.sequelize;

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Базовый маршрут
//app.get('/', (req, res) => res.send('Backend работает!'));

// === API РОУТЫ ===
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/apiRoutes'));           // общие роуты

// Admin роуты (лучше подключать напрямую, а не через /api/admin)
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/suppliers', require('./routes/admin/suppliers'));

// === VUE FRONTEND ===
app.use(express.static('public'));

// Catch-all для Vue SPA — используем use вместо get('*')
app.use((req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключились к MySQL');

    // await sequelize.sync({ alter: true });   // используй alter: true в продакшене осторожно
    console.log('✅ База данных готова');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Ошибка запуска:', err.message);
  }
};

startServer();