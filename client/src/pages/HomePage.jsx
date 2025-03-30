import React, { useState, useEffect } from 'react';
import { getTrendingAnime } from '../services/kitsuApi';
import AnimeCard from '../components/AnimeCard/AnimeCard';
import styles from './HomePage.module.css';

// Компонент секции
const AnimeSection = ({ title, animeList, isLoading, error }) => {
    return (
        <section className={styles.section}>
            {/* Используем тег h2 для заголовка секции */}
            <h2 className={styles.sectionTitle}>{title}</h2>
            {isLoading && <div className={styles.loading}>Загрузка...</div>}
            {error && <div className={styles.error}>Ошибка загрузки: {error.message || 'Не удалось получить данные'}</div>}
            {!isLoading && !error && animeList && animeList.length === 0 && (
                <div className={styles.notFound}>Ничего не найдено.</div>
            )}
            {!isLoading && !error && animeList && animeList.length > 0 && (
                <div className={styles.animeGrid}>
                    {animeList.map((anime) => (
                        <AnimeCard key={anime.id} anime={anime} />
                    ))}
                </div>
            )}
        </section>
    );
};

// Главная страница
const HomePage = () => {
    const [trendingAnime, setTrendingAnime] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            setError(null);
            const { list, error: fetchError } = await getTrendingAnime({ limit: 24 }); // Запросим больше аниме

            if (fetchError) {
                setError(fetchError);
                setTrendingAnime([]);
            } else {
                setTrendingAnime(list);
            }
            setIsLoading(false);
        };

        fetchTrending();
    }, []);

    return (
        <div className={styles.homeContainer}>
            <AnimeSection
                title="В тренде сейчас"
                animeList={trendingAnime}
                isLoading={isLoading}
                error={error}
            />
            {/* Можно добавить другие секции */}
        </div>
    );
};

export default HomePage;