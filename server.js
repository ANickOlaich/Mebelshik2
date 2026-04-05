const express = require('express');
const cors = require('cors');
const db = require('./models');
const sequelize = db.sequelize;

require('dotenv').config();
console.log('JWT_SECRET loaded:', !!process.env.JWT_SECRET);

const requestLogger = require('./middleware/requestLogger');
const { protect, restrictTo } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.get('/', (req, res) => res.send('Backend работает!'));

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/suppliers', require('./routes/admin/suppliers'));

// Отдаём статические файлы Vue
app.use(express.static('public'));

// Важно! Для Vue Router (History Mode)
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключились к MySQL');

    await sequelize.sync({ logging: console.log }) // 🔥 ЭТО ОБЯЗАТЕЛЬНО
    console.log('✅ Таблицы созданы / синхронизированы')
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Сервер на порту ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Ошибка БД:', err.message);
  }
};

startServer();