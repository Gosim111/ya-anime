const User = require('../models/User');
const mongoose = require('mongoose'); // Понадобится для ObjectId

// @desc    Получить список аниме пользователя
// @route   GET /api/users/tag/:tagPart/list
// @access  Public
exports.getUserAnimeList = async (req, res, next) => {
    try {
        const tagPart = req.params.tagPart;
        const user = await User.findOne({ tag: `@${tagPart}` })
            .select('animeList tag nickname') // Выбираем только нужные поля
            .lean(); // Используем lean() для получения простого JS-объекта

        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Фильтруем список по статусу, если он указан в query параметрах
        const { status } = req.query;
        let filteredList = user.animeList || [];
        if (status && ['watching', 'planned', 'completed', 'on_hold', 'dropped'].includes(status)) {
            filteredList = filteredList.filter(item => item.status === status);
        }

        // Сортируем по дате обновления (сначала новые)
        filteredList.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

        res.json({
            // Возвращаем отфильтрованный и отсортированный список
            // Можно добавить пагинацию, если списки будут очень большими
            list: filteredList,
            // Дополнительно можно вернуть информацию о владельце списка
            owner: { tag: user.tag, nickname: user.nickname }
        });

    } catch (error) {
        console.error('Ошибка при получении списка аниме:', error);
        next(error);
    }
};

// @desc    Добавить или обновить запись в списке аниме ТЕКУЩЕГО пользователя
// @route   PUT /api/users/me/list/:kitsuId
// @access  Private (требует protect middleware)
exports.updateMyAnimeListItem = async (req, res, next) => {
    const kitsuId = parseInt(req.params.kitsuId, 10); // ID аниме из Kitsu
    const userId = req.user.id; // ID текущего пользователя из protect middleware
    // Ожидаемые данные в теле запроса: status, rating, progress
    const { status, rating, progress } = req.body;

    // Валидация входных данных
    if (isNaN(kitsuId) || kitsuId <= 0) {
        return res.status(400).json({ message: 'Неверный ID аниме' });
    }
    const allowedStatuses = ['watching', 'planned', 'completed', 'on_hold', 'dropped'];
    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Неверный статус аниме' });
    }
    if (rating !== undefined && rating !== null && (typeof rating !== 'number' || rating < 1 || rating > 10)) {
        return res.status(400).json({ message: 'Неверная оценка (должна быть от 1 до 10 или null)' });
    }
    if (progress !== undefined && (typeof progress !== 'number' || progress < 0 || !Number.isInteger(progress))) {
        return res.status(400).json({ message: 'Неверный прогресс (должно быть целое неотрицательное число)' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            // Это не должно произойти, если protect работает
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Ищем существующую запись в списке
        const existingItemIndex = user.animeList.findIndex(item => item.kitsuId === kitsuId);
        const now = new Date();

        let updatedItem;

        if (existingItemIndex > -1) {
            // --- Обновляем существующую запись ---
            const itemToUpdate = user.animeList[existingItemIndex];
            if (status) itemToUpdate.status = status;
            // Обновляем оценку, позволяя установить null
            if (rating !== undefined) itemToUpdate.rating = rating === null ? null : Number(rating);
            if (progress !== undefined) itemToUpdate.progress = Number(progress);
            itemToUpdate.updatedAt = now;
            updatedItem = itemToUpdate;
            if (process.env.NODE_ENV === 'development') {
                console.log(`[List Ctrl] Обновление записи для kitsuId ${kitsuId} у пользователя ${userId}`);
            }
        } else {
            // --- Добавляем новую запись ---
            const newItem = {
                kitsuId: kitsuId,
                status: status || 'planned', // По умолчанию 'planned', если не указан
                rating: rating !== undefined ? (rating === null ? null : Number(rating)) : null,
                progress: progress !== undefined ? Number(progress) : 0,
                addedAt: now,
                updatedAt: now,
            };
            user.animeList.push(newItem);
            updatedItem = newItem;
            if (process.env.NODE_ENV === 'development') {
                console.log(`[List Ctrl] Добавление записи для kitsuId ${kitsuId} к пользователю ${userId}`);
            }
        }

        // Сохраняем изменения пользователя
        await user.save();

        // Возвращаем обновленную/добавленную запись
        res.status(200).json(updatedItem);

    } catch (error) {
        console.error('Ошибка при обновлении/добавлении записи в список:', error);
        if (error.name === 'ValidationError') { // Ошибки валидации схемы AnimeListItemSchema
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join('. ') });
        }
        next(error);
    }
};


// @desc    Удалить запись из списка аниме ТЕКУЩЕГО пользователя
// @route   DELETE /api/users/me/list/:kitsuId
// @access  Private
exports.deleteMyAnimeListItem = async (req, res, next) => {
    const kitsuId = parseInt(req.params.kitsuId, 10);
    const userId = req.user.id;

    if (isNaN(kitsuId) || kitsuId <= 0) {
        return res.status(400).json({ message: 'Неверный ID аниме' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Ищем индекс элемента для удаления
        const itemIndex = user.animeList.findIndex(item => item.kitsuId === kitsuId);

        if (itemIndex === -1) {
            // Если элемента нет в списке, ничего не делаем или возвращаем ошибку
            return res.status(404).json({ message: 'Запись с таким ID аниме не найдена в списке' });
        }

        // Удаляем элемент из массива
        user.animeList.splice(itemIndex, 1);

        if (process.env.NODE_ENV === 'development') {
            console.log(`[List Ctrl] Удаление записи kitsuId ${kitsuId} у пользователя ${userId}`);
        }

        // Сохраняем изменения
        await user.save();

        res.status(200).json({ message: 'Запись успешно удалена из списка' });

    } catch (error) {
        console.error('Ошибка при удалении записи из списка:', error);
        next(error);
    }
};