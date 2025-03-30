import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- Используем API списков ---
import { getUserProfileByTagPart, updateMyProfile } from '../services/userApi';
import { fetchUserAnimeList } from '../services/listApi'; // <<<--- Импорт функции списка
// --- Конец ---
import { useAuth } from '/src/context/AuthContext.jsx';
import Modal from '../components/Modal/Modal';
import AnimeCard from '../components/AnimeCard/AnimeCard'; // <<<--- Импорт карточки аниме
import styles from './ProfilePage.module.css';
import homeStyles from './HomePage.module.css';
import modalStyles from '../components/Modal/Modal.module.css';

// Модальное окно редактирования (без изменений)
const EditNicknameModal = ({ currentNickname, isOpen, onClose, onSave }) => { /* ... код ... */
    const [newNickname, setNewNickname] = useState(currentNickname || '');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) { setNewNickname(currentNickname || ''); setError(''); setIsSaving(false); }
    }, [isOpen, currentNickname]);

    const handleSave = async () => {
        setError('');
        const trimmedNickname = newNickname.trim();
        if (trimmedNickname.length > 30) { setError('Никнейм не может быть длиннее 30 символов'); return; }
        setIsSaving(true);
        try { await onSave(trimmedNickname === '' ? null : trimmedNickname); onClose(); }
        catch (err) { setError(err.message || 'Ошибка сохранения'); }
        finally { setIsSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Редактировать никнейм">
            <div className={modalStyles.inputGroup}> <label htmlFor="nicknameEdit" className={modalStyles.label}>Новый никнейм (оставьте пустым, чтобы убрать)</label> <input type="text" id="nicknameEdit" value={newNickname} onChange={(e) => setNewNickname(e.target.value)} className={modalStyles.input} maxLength="30" placeholder="Введите никнейм"/> </div>
            {error && <p className={styles.modalError}>{error}</p>}
            <div className={modalStyles.buttonContainer}> <button onClick={onClose} className={`${modalStyles.modalButton} ${modalStyles.secondary}`} disabled={isSaving}>Отмена</button> <button onClick={handleSave} className={`${modalStyles.modalButton} ${modalStyles.primary}`} disabled={isSaving}> {isSaving ? 'Сохранение...' : 'Сохранить'} </button> </div>
        </Modal>
    );
};

// --- Компонент для вкладки списка ---
const AnimeListTab = ({ tagPart, status, title }) => {
    const [list, setList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const loadList = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchUserAnimeList(tagPart, status);
                if (isMounted) setList(data);
            } catch (err) {
                if (isMounted) setError(err.message || "Ошибка загрузки списка");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadList();
        return () => { isMounted = false; };
    }, [tagPart, status]); // Перезагружаем при смене тега или статуса

    if (isLoading) return <div className={homeStyles.loading} style={{ minHeight: '150px', fontSize: 'var(--font-size-base)' }}>Загрузка "{title}"...</div>;
    if (error) return <div className={homeStyles.error} style={{ minHeight: '150px', fontSize: 'var(--font-size-base)' }}>{error}</div>;
    if (list.length === 0) return <div className={styles.placeholderContent} style={{ minHeight: '150px' }}><p>Список "{title}" пуст.</p></div>;

    return (
        // Используем сетку, похожую на главную/каталог, но адаптируем
        <div className={styles.profileAnimeGrid}>
            {list.map(item => (
                // Нам нужны полные данные аниме для карточки, а в списке их нет.
                // Это проблема текущей структуры. Пока отобразим заглушку.
                // TODO: Переделать API списка или загружать детали аниме здесь.
                <div key={item.kitsuId} className={styles.listItemPlaceholder}>
                    Kitsu ID: {item.kitsuId}<br/>
                    Статус: {item.status}<br/>
                    Рейтинг: {item.rating ?? 'N/A'}<br/>
                    Прогресс: {item.progress}
                </div>
                // <AnimeCard key={item.kitsuId} anime={animeDetailsForItem} /> // <- Так должно быть
            ))}
        </div>
    );
};


// Основной компонент страницы
const ProfilePage = () => {
    const { tagPart } = useParams();
    const { user: currentUser, isAuthenticated, updateUserState } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditNicknameModalOpen, setIsEditNicknameModalOpen] = useState(false);
    // --- Состояние для активной вкладки списка ---
    const [activeListTab, setActiveListTab] = useState('watching'); // По умолчанию "Смотрю"
    // --- Конец состояния ---

    useEffect(() => {
        const fetchProfile = async () => { /* ... код загрузки профиля ... */
            if (import.meta.env.DEV) console.log(`ProfilePage: Загрузка профиля для tagPart: "${tagPart}"`);
            if (!tagPart) { setError('Тег пользователя не найден в URL'); setIsLoading(false); return; }
            setIsLoading(true); setError(null); setProfileData(null);
            try {
                const data = await getUserProfileByTagPart(tagPart); setProfileData(data);
            } catch (err) { setError(err.message || 'Не удалось загрузить профиль'); }
            finally { setIsLoading(false); }
        };
        fetchProfile(); window.scrollTo({ top: 0, behavior: 'auto' });
    }, [tagPart]);

    const isCurrentUserProfile = isAuthenticated && profileData && currentUser?.tag === profileData.tag;

    const handleNicknameSave = async (newNickname) => { /* ... код сохранения ника ... */
        if (!isCurrentUserProfile) return;
        if (import.meta.env.DEV) console.log("ProfilePage: Попытка сохранения никнейма:", newNickname);
        try {
            const response = await updateMyProfile({ nickname: newNickname });
            if (import.meta.env.DEV) console.log("ProfilePage: Ответ обновления:", response);
            setProfileData(prev => ({ ...prev, nickname: response.nickname }));
            updateUserState({ nickname: response.nickname });
        } catch (err) { console.error("ProfilePage: Ошибка сохранения никнейма:", err); throw err; }
    };

    const registrationDate = profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Неизвестно';

    if (isLoading) { return <div className={homeStyles.loading}>Загрузка профиля...</div>; }
    if (error === 'Пользователь не найден') { return <div className={homeStyles.notFound}>Профиль с тегом "@ {tagPart}" не найден.</div>; }
    if (error) { return <div className={homeStyles.error}>Ошибка загрузки профиля: {error}</div>; }
    if (!profileData) { return <div className={homeStyles.notFound}>Не удалось загрузить данные профиля.</div>; }

    const displayName = profileData.nickname || profileData.tag;
    const listStatuses = [
        { key: 'watching', label: 'Смотрю' },
        { key: 'planned', label: 'Запланировано' },
        { key: 'completed', label: 'Просмотрено' },
        { key: 'on_hold', label: 'Отложено' },
        { key: 'dropped', label: 'Брошено' },
    ];

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileCover}> <img src="/default-cover.jpg" alt="Обложка профиля" className={styles.coverImage} /> </div>
            <div className={styles.profileContent}>
                <div className={styles.profileSidebar}>
                    <div className={styles.avatarWrapper}> <img src={profileData.avatar || '/default-avatar.png'} alt={`Аватар ${displayName}`} className={styles.avatar} /> </div>
                    <div className={styles.sidebarInfo}>
                        <h1 className={`${styles.nickname} ${isCurrentUserProfile ? styles.editableField : ''}`} onClick={isCurrentUserProfile ? () => setIsEditNicknameModalOpen(true) : undefined} title={isCurrentUserProfile ? "Нажмите, чтобы изменить никнейм" : ""}>{displayName}</h1>
                        {profileData.nickname && <p className={styles.tag}>{profileData.tag}</p>}
                        <p className={styles.registrationDate}> На сайте с: {registrationDate} </p>
                    </div>
                </div>
                <div className={styles.profileMain}>
                    {/* --- Табы для списков аниме --- */}
                    <div className={styles.listTabsContainer}>
                        <div className={styles.listTabs}>
                            {listStatuses.map(statusInfo => (
                                <button
                                    key={statusInfo.key}
                                    className={`${styles.tabButton} ${activeListTab === statusInfo.key ? styles.tabButtonActive : ''}`}
                                    onClick={() => setActiveListTab(statusInfo.key)}
                                >
                                    {statusInfo.label}
                                </button>
                            ))}
                        </div>
                        {/* --- Отображение активной вкладки --- */}
                        <div className={styles.listTabContent}>
                            {listStatuses.find(s => s.key === activeListTab) && (
                                <AnimeListTab
                                    key={activeListTab} // Важно для перезагрузки при смене таба
                                    tagPart={tagPart}
                                    status={activeListTab}
                                    title={listStatuses.find(s => s.key === activeListTab)?.label || ''}
                                />
                            )}
                        </div>
                    </div>
                    {/* --- Конец табов --- */}
                </div>
            </div>
            {isCurrentUserProfile && ( <EditNicknameModal currentNickname={profileData.nickname} isOpen={isEditNicknameModalOpen} onClose={() => setIsEditNicknameModalOpen(false)} onSave={handleNicknameSave} /> )}
        </div>
    );
};

export default ProfilePage;