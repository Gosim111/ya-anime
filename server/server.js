const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db'); // Импортируем функцию подключения
const authRoutes = require('./routes/authRoutes'); // Импортируем роуты аутентификации
const userRoutes = require('./routes/userRoutes'); // Импортируем роуты пользователей

// Загрузка переменных окружения
dotenv.config();

// Подключение к MongoDB
connectDB();

const app = express();

// Middleware для парсинга JSON тела запроса
app.use(express.json());

// Middleware для CORS
// Разрешаем запросы с URL фронтенда из .env
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Фоллбэк на порт по умолчанию
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Базовый роут для проверки
app.get('/', (req, res) => {
    res.send('API работает...');
});

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Middleware для обработки ошибок (простой пример)
app.use((err, req, res, next) => {
    console.error("Ошибка сервера:", err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Внутренняя ошибка сервера',
        // В режиме разработки можно добавить stack trace
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});


const PORT = process.env.PORT || 5001; // Используем порт из .env или 5001 по умолчанию

app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));

// Обработка неперехваченных Promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Можно добавить логику для более корректного завершения работы сервера
    // process.exit(1);
});