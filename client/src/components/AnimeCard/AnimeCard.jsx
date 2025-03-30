import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AnimeCard.module.css';

// Значки
const AnimeTypeBadge = ({ subtype }) => {
    if (!subtype) return null;
    const typeMap = { 'TV': 'TV', 'MOVIE': 'Фильм', 'OVA': 'OVA', 'ONA': 'ONA', 'SPECIAL': 'Спешл', 'MUSIC': 'Клип' };
    const formattedType = typeMap[subtype.toUpperCase()] || subtype;
    return <span className={styles.badge} title={subtype}>{formattedType}</span>;
};

const AnimeYearBadge = ({ startDate }) => {
    const year = startDate ? startDate.substring(0, 4) : null;
    if (!year) return null;
    return <span className={styles.badge} title={`Год выхода: ${year}`}>{year}</span>;
}

const AnimeCard = ({ anime }) => {
    if (!anime || !anime.id || !anime.title || !anime.slug) {
        // Оставляем предупреждение, но не логируем в проде
        if (import.meta.env.DEV) {
            console.warn("AnimeCard: Получены неполные данные из Kitsu API:", anime);
        }
        return null;
    }

    const posterUrl = anime.posterImage?.medium
        || anime.posterImage?.small
        || '/placeholder-poster.png';

    // --- ОБНОВЛЕНИЕ ФОРМИРОВАНИЯ ССЫЛКИ ---
    const kitsuId = anime.id;
    const kitsuSlug = anime.slug;
    // Новый формат ссылки: /anime/ID/слаг
    const linkTo = `/anime/${kitsuId}/${kitsuSlug}`;
    // Убрали логгирование отсюда, т.к. проблема была дальше
    // console.log(`AnimeCard: ID=${kitsuId} (type: ${typeof kitsuId}), Slug=${kitsuSlug}, Link=${linkTo}`);
    // --- КОНЕЦ ОБНОВЛЕНИЯ ---


    return (
        <Link to={linkTo} className={styles.cardLink} title={anime.title}>
            <article className={styles.card}>
                <div className={styles.posterWrapper}>
                    <img
                        key={posterUrl}
                        src={posterUrl}
                        alt={`Постер ${anime.title}`}
                        className={styles.poster}
                        loading="lazy"
                        onError={(e) => {
                            const placeholderSrc = '/placeholder-poster.png';
                            if (e.target.src !== placeholderSrc) {
                                e.target.src = placeholderSrc;
                            } else {
                                if (import.meta.env.DEV) { // Логируем ошибку заглушки только в разработке
                                    console.error(`Не удалось загрузить даже заглушку ${placeholderSrc} для ${anime.title}`);
                                }
                                e.target.style.display = 'none';
                            }
                        }}
                    />
                </div>
                <div className={styles.info}>
                    <h3 className={styles.title}>{anime.title}</h3>
                    <div className={styles.meta}>
                        {anime.subtype && <AnimeTypeBadge subtype={anime.subtype} />}
                        {anime.startDate && <AnimeYearBadge startDate={anime.startDate} />}
                    </div>
                </div>
            </article>
        </Link>
    );
};

export default AnimeCard;