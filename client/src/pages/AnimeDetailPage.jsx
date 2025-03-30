import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getAnimeDetails } from '../services/kitsuApi';
import { updateMyListItem, deleteMyListItem } from '../services/listApi';
import { useAuth } from '/src/context/AuthContext.jsx';
import ReactPlayer from 'react-player/lazy';
import styles from './AnimeDetailPage.module.css';
import homeStyles from './HomePage.module.css';

// Компонент деталей аниме с обновленным прогрессом
const AnimeDetailsDisplay = ({ anime, onStatusUpdate, currentListItem, isAuth, isListUpdating }) => {
    if (!anime) return null;

    const posterUrl = anime.posterImage?.large || anime.posterImage?.original || anime.posterImage?.medium || '/placeholder-poster.png';
    const genresString = anime.genres?.map(g => g.name).join(', ') || 'Нет данных';
    const currentStatus = currentListItem?.status || "";
    const currentRating = currentListItem?.rating || "";
    const currentProgress = currentListItem?.progress ?? 0; // Используем ?? для дефолта 0

    const handleStatusChange = (e) => { /* ... */
        const newStatus = e.target.value;
        if (newStatus === "remove") { onStatusUpdate(anime.id, { action: 'delete' }); }
        else if (newStatus) { onStatusUpdate(anime.id, { status: newStatus }); }
    };
    const handleRatingChange = (e) => { /* ... */
        const newRating = e.target.value ? parseInt(e.target.value, 10) : null;
        if (newRating !== currentListItem?.rating || !currentListItem) { onStatusUpdate(anime.id, { rating: newRating, status: currentStatus || 'planned' }); }
    };

    // --- ИЗМЕНЕНИЕ: Обработчик для Select прогресса ---
    const handleProgressSelectChange = (e) => {
        const newProgress = parseInt(e.target.value, 10);
        // Проверяем, что значение не NaN и отличается от текущего, или аниме не было в списке
        if (!isNaN(newProgress) && (newProgress !== currentProgress || !currentListItem)) {
            onStatusUpdate(anime.id, { progress: newProgress, status: currentStatus || 'planned' });
        }
    };
    // --- КОНЕЦ ИЗМЕНЕНИЯ ---

    const statusClass = currentStatus ? styles[`status_${currentStatus}`] : '';

    // --- Генерируем опции для прогресса ---
    const progressOptions = useMemo(() => {
        const options = [];
        // Добавляем опцию "0 серий"
        options.push(<option key={0} value={0}>0 серий</option>);
        if (anime.episodeCount && anime.episodeCount > 0) {
            for (let i = 1; i <= anime.episodeCount; i++) {
                options.push(<option key={i} value={i}>{i} серия</option>);
            }
        } else {
            // Если кол-во серий неизвестно, добавляем несколько опций для ручного ввода (или можно оставить только 0)
            options.push(<option key={1} value={1}>1 серия</option>);
            // Можно добавить больше, но <select> не лучший вариант для неизвестного кол-ва
        }
        return options;
    }, [anime.episodeCount]);
    // --- КОНЕЦ ГЕНЕРАЦИИ ---

    return (
        <div className={styles.detailsContent}>
            <div className={styles.posterColumn}>
                <img src={posterUrl} alt={`Постер ${anime.title}`} className={styles.poster} />
                {isAuth && (
                    <div className={styles.listControls}>
                        <h4>Мой список:</h4>
                        <select value={currentStatus} onChange={handleStatusChange} className={`${styles.controlSelect} ${statusClass}`} disabled={isListUpdating}>
                            <option value="" disabled={!!currentListItem}>{currentListItem ? 'Изменить статус' : 'Добавить в список'}</option>
                            <option value="watching">Смотрю</option>
                            <option value="planned">Запланировано</option>
                            <option value="completed">Просмотрено</option>
                            <option value="on_hold">Отложено</option>
                            <option value="dropped">Брошено</option>
                            {currentListItem && <option value="remove" style={{ color: 'var(--text-muted)' }}>--- Убрать из списка ---</option>}
                        </select>
                        <div className={styles.controlGroup}>
                            <label htmlFor="rating">Оценка:</label>
                            <select id="rating" value={currentRating} onChange={handleRatingChange} className={styles.controlSelectSmall} disabled={isListUpdating}>
                                <option value="">Нет</option> {[...Array(10).keys()].map(n => (<option key={n + 1} value={n + 1}>{n + 1}</option>))}
                            </select>
                        </div>
                        {/* --- ИЗМЕНЕНИЕ: Заменяем Input на Select для прогресса --- */}
                        <div className={styles.controlGroup}>
                            <label htmlFor="progress">Прогресс:</label>
                            <select
                                id="progress"
                                value={currentProgress} // Используем текущий прогресс
                                onChange={handleProgressSelectChange} // Новый обработчик
                                className={styles.controlSelectSmall} // Используем тот же стиль, что и для оценки
                                disabled={isListUpdating}
                                aria-label="Просмотрено серий"
                            >
                                {progressOptions} {/* Рендерим сгенерированные опции */}
                            </select>
                            {/* Убираем отображение " / X" т.к. оно в опциях */}
                            {/* {anime.episodeCount && <span> / {anime.episodeCount}</span>} */}
                        </div>
                        {/* --- КОНЕЦ ИЗМЕНЕНИЯ --- */}
                    </div>
                )}
            </div>
            <div className={styles.infoColumn}> <h1 className={styles.title}>{anime.title}</h1> <div className={styles.metaGrid}> {anime.subtype && <div><strong>Тип:</strong> {anime.subtype.toUpperCase()}</div>} {anime.startDate && <div><strong>Год:</strong> {anime.startDate.substring(0, 4)}</div>} {anime.status && <div><strong>Статус:</strong> {anime.status}</div>} {anime.episodeCount && <div><strong>Эпизоды:</strong> {anime.episodeCount}</div>} {anime.episodeLength && <div><strong>Длительность:</strong> ~{anime.episodeLength} мин.</div>} {anime.averageRating && <div><strong>Рейтинг Kitsu:</strong> {anime.averageRating} / 100</div>} {anime.ageRating && <div><strong>Возраст:</strong> {anime.ageRating} {anime.ageRatingGuide ? `(${anime.ageRatingGuide})` : ''}</div>} </div> <div className={styles.genres}><strong>Жанры:</strong> {genresString}</div> {anime.synopsis && (<div className={styles.synopsisSection}><h2 className={styles.sectionTitle}>Описание</h2><p className={styles.synopsisText}>{anime.synopsis}</p></div>)} {anime.youtubeVideoId && (<div className={styles.trailerSection}><h2 className={styles.sectionTitle}>Трейлер</h2><div className={styles.playerWrapper}><ReactPlayer key={anime.youtubeVideoId} url={`https://www.youtube.com/watch?v=${anime.youtubeVideoId}`} controls={true} width='100%' height='100%' className={styles.reactPlayer} onError={(e) => console.error('Ошибка YouTube плеера:', e)}/></div></div>)} </div>
        </div>
    );
};

// Основной компонент страницы (без изменений в логике)
const AnimeDetailPage = () => { /* ... код без изменений ... */
    const { animeId: id } = useParams();
    const { user: currentUser, isAuthenticated, updateUserState } = useAuth();
    const [animeDetails, setAnimeDetails] = useState(null);
    const [isLoadingKitsu, setIsLoadingKitsu] = useState(true);
    const [kitsuError, setKitsuError] = useState(null);
    const [currentListItem, setCurrentListItem] = useState(null);
    const [listUpdateError, setListUpdateError] = useState(null);
    const [isListUpdating, setIsListUpdating] = useState(false);

    const fetchCurrentListItem = useCallback(async () => { if (!isAuthenticated || !currentUser?.animeList || !id) { setCurrentListItem(null); return; } const numericId = parseInt(id, 10); const foundItem = currentUser.animeList.find(item => item.kitsuId === numericId); if (import.meta.env.DEV && foundItem) console.log("[AnimeDetail] Найдена запись в локальном списке:", foundItem); setCurrentListItem(foundItem || null); }, [isAuthenticated, currentUser, id]);

    useEffect(() => { let isMounted = true; const fetchAllDetails = async () => { if (!id) { setIsLoadingKitsu(false); return; } setIsLoadingKitsu(true); setKitsuError(null); setAnimeDetails(null); try { const kitsuData = await getAnimeDetails(id); if (!isMounted) return; if (kitsuData.error) throw kitsuData.error; if (!kitsuData.data) throw new Error('Аниме не найдено в Kitsu'); setAnimeDetails(kitsuData.data); } catch (kitsuErr) { if (!isMounted) return; console.error("Ошибка загрузки Kitsu:", kitsuErr); setKitsuError(kitsuErr); setAnimeDetails(null); } finally { if (isMounted) setIsLoadingKitsu(false); } }; fetchAllDetails(); window.scrollTo({ top: 0, behavior: 'auto' }); fetchCurrentListItem(); return () => { isMounted = false; }; }, [id, fetchCurrentListItem]);

    const handleStatusUpdate = useCallback(async (kitsuId, updateData) => { if (!isAuthenticated || !kitsuId) return; setListUpdateError(null); setIsListUpdating(true); try { if (updateData.action === 'delete') { await deleteMyListItem(kitsuId); if (import.meta.env.DEV) console.log(`[AnimeDetail] Запись ${kitsuId} удалена`); setCurrentListItem(null); if (currentUser && updateUserState) { const updatedList = currentUser.animeList.filter(item => item.kitsuId !== kitsuId); updateUserState({ animeList: updatedList }); } } else { const dataToSend = { ...updateData }; if (!currentListItem && !dataToSend.status) { dataToSend.status = 'planned'; } const updatedItemData = await updateMyListItem(kitsuId, dataToSend); if (import.meta.env.DEV) console.log(`[AnimeDetail] Запись ${kitsuId} обновлена/добавлена:`, updatedItemData); setCurrentListItem(updatedItemData); if (currentUser && updateUserState) { const listIndex = currentUser.animeList.findIndex(item => item.kitsuId === kitsuId); let updatedList; if (listIndex > -1) { updatedList = [...currentUser.animeList]; updatedList[listIndex] = updatedItemData; } else { updatedList = [...currentUser.animeList, updatedItemData]; } updateUserState({ animeList: updatedList }); } } } catch (error) { console.error("[AnimeDetail] Ошибка обновления списка:", error); setListUpdateError(error.message || "Ошибка обновления списка"); } finally { setIsListUpdating(false); } }, [isAuthenticated, currentUser, updateUserState, currentListItem]);

    if (isLoadingKitsu) { return <div className={homeStyles.loading}>Загрузка данных аниме...</div>; }
    if (kitsuError) { return <div className={homeStyles.error}>Ошибка загрузки Kitsu: {kitsuError.message}</div>; }
    if (!animeDetails) { return <div className={homeStyles.notFound}>Аниме с ID "{id}" не найдено.</div>; }

    return ( <div className={styles.detailPageContainer}> <AnimeDetailsDisplay anime={animeDetails} onStatusUpdate={handleStatusUpdate} currentListItem={currentListItem} isAuth={isAuthenticated} isListUpdating={isListUpdating} /> {listUpdateError && <p className={styles.listUpdateError}>{listUpdateError}</p>} {isListUpdating && <div className={styles.listUpdatingIndicator}>Обновление списка...</div>} </div> );
};
export default AnimeDetailPage;