const express = require('express');
const cors = require('cors');
const db = require('./models');
const sequelize = db.sequelize;
const path = require('path');
const requestLogger = require('./middleware/requestLogger.js');
const visitTracker = require('./middleware/visitTracker')

require('dotenv').config();

const app = express();

app.use(express.json({ limit: '10mb' }));        // or higher, e.g. '50mb'
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(express.json());
app.use(cors());


app.use(cors({
  origin: ['https://mebelshik.com.ua', 'http://mebelshik.com.ua', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.use(requestLogger);
//app.use(visitTracker)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// === API РОУТЫ ===
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api', require('./routes/apiRoutes'))
/*
// === VUE FRONTEND ===
app.use(express.static('public'));

// Catch-all для Vue SPA — используем use вместо get('*')
app.use((req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
*/
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