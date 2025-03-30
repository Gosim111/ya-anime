import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom'; // Для управления параметрами URL (пагинация)
import { getAnimeList } from '../services/kitsuApi';
import AnimeCard from '../components/AnimeCard/AnimeCard';
import Pagination from '../components/Pagination/Pagination'; // Создадим компонент пагинации
import styles from './CatalogPage.module.css';
import homeStyles from './HomePage.module.css'; // Переиспользуем стили сетки и состояний

// --- ИЗМЕНЕНО НА 20 ---
const ITEMS_PER_PAGE = 20; // Количество элементов на странице
// --- КОНЕЦ ИЗМЕНЕНИЯ ---

const CatalogPage = () => {
    const [animeList, setAnimeList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);

    // Используем useSearchParams для чтения и установки номера страницы в URL
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    // Функция загрузки данных
    const fetchCatalogData = useCallback(async (page) => {
        setIsLoading(true);
        setError(null);
        // Теперь getAnimeList будет использовать лимит 20 по умолчанию или переданный (но не более 20)
        const { list, totalCount, error: fetchError } = await getAnimeList({
            page: page,
            limit: ITEMS_PER_PAGE, // Передаем константу
            sort: '-user_count', // Возвращаем сортировку по популярности
            fields: 'titles,canonicalTitle,slug,startDate,subtype,status,posterImage,averageRating' // Возвращаем нужные поля
        });

        if (fetchError) {
            setError(fetchError);
            setAnimeList([]);
            setTotalPages(0);
        } else {
            setAnimeList(list);
            // Рассчитываем общее количество страниц
            setTotalPages(totalCount ? Math.ceil(totalCount / ITEMS_PER_PAGE) : 0);
        }
        setIsLoading(false);
    }, []); // useCallback мемоизирует функцию

    // Загружаем данные при изменении currentPage
    useEffect(() => {
        fetchCatalogData(currentPage);
        // Прокрутка вверх при смене страницы
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage, fetchCatalogData]);

    // Обработчик смены страницы
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) { // Добавили проверку границ
            // Обновляем параметр 'page' в URL, что вызовет useEffect
            setSearchParams({ page: newPage.toString() });
        }
    };

    return (
        <div className={styles.catalogContainer}>
            <h1 className={styles.pageTitle}>Каталог Аниме</h1>

            {/* TODO: Добавить блок для фильтров и сортировки */}
            {/* <div className={styles.controls}> ... </div> */}

            {/* Используем стили из HomePage для состояний и сетки */}
            {isLoading && <div className={homeStyles.loading}>Загрузка...</div>}
            {error && <div className={homeStyles.error}>Ошибка загрузки: {error.message || 'Не удалось получить данные'}</div>}
            {!isLoading && !error && animeList.length === 0 && (
                <div className={homeStyles.notFound}>Аниме не найдено. Попробуйте изменить фильтры.</div>
            )}
            {!isLoading && !error && animeList.length > 0 && (
                <>
                    <div className={homeStyles.animeGrid}>
                        {animeList.map((anime) => (
                            <AnimeCard key={anime.id} anime={anime} />
                        ))}
                    </div>

                    {/* Компонент пагинации */}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default CatalogPage;