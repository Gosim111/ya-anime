import React from 'react';
import styles from './Pagination.module.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Не рендерим, если страниц 1 или меньше
    if (totalPages <= 1) {
        return null;
    }

    // Определяем диапазон отображаемых номеров страниц
    const getPageNumbers = () => {
        const delta = 2; // Сколько страниц показывать по бокам от текущей
        const left = currentPage - delta;
        const right = currentPage + delta;
        const range = [];
        let rangeWithDots = []; // Изменил на let

        for (let i = 1; i <= totalPages; i++) {
            // Всегда показываем первую, последнюю, текущую и страницы в диапазоне delta
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                range.push(i);
            }
        }

        // Убираем дублирующиеся многоточия и добавляем их там, где пропуск
        let last = 0; // Используем 0 для инициализации
        for (const pageNum of range) {
            if (last) {
                // Если разрыв больше 1, добавляем многоточие
                if (pageNum - last > 2) {
                    rangeWithDots.push('...');
                } else if (pageNum - last === 2) {
                    // Если разрыв ровно в 1 страницу, добавляем пропущенную страницу
                    rangeWithDots.push(last + 1);
                }
            }
            rangeWithDots.push(pageNum);
            last = pageNum;
        }


        // Убедимся, что первая и последняя страницы всегда есть (если нужны)
        if (rangeWithDots.length > 0) {
            if (rangeWithDots[0] !== 1) {
                // Добавляем 1, если её нет
                if (rangeWithDots[0] !== '...') { // Проверяем, не начинается ли с многоточия
                    if(rangeWithDots[0] > 2) { // Если вторая отображаемая страница больше 2
                        rangeWithDots.unshift(1, '...');
                    } else { // Если вторая отображаемая страница это 2
                        rangeWithDots.unshift(1);
                    }
                } else {
                    // Если начинается с многоточия, просто добавляем 1
                    rangeWithDots.unshift(1);
                }
            }
            if (rangeWithDots[rangeWithDots.length - 1] !== totalPages) {
                // Добавляем totalPages, если её нет
                if (rangeWithDots[rangeWithDots.length - 1] !== '...') { // Проверяем, не заканчивается ли многоточием
                    if(rangeWithDots[rangeWithDots.length - 1] < totalPages - 1) { // Если предпоследняя отображаемая страница меньше totalPages - 1
                        rangeWithDots.push('...', totalPages);
                    } else { // Если предпоследняя отображаемая страница это totalPages - 1
                        rangeWithDots.push(totalPages);
                    }
                } else {
                    // Если заканчивается многоточием, просто добавляем totalPages
                    rangeWithDots.push(totalPages);
                }
            }
        }


        return rangeWithDots;
    };


    const pageNumbers = getPageNumbers();

    return (
        <nav className={styles.pagination} aria-label="Пагинация">
            {/* Кнопка "Назад" */}
            <button
                className={`${styles.pageButton} ${styles.arrowButton}`}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Предыдущая страница"
            >
                {'<'}
            </button>

            {/* Номера страниц */}
            {pageNumbers.map((pageNum, index) =>
                pageNum === '...' ? (
                    <span key={`dots-${index}`} className={styles.dots}>...</span>
                ) : (
                    <button
                        key={pageNum}
                        className={`${styles.pageButton} ${currentPage === pageNum ? styles.active : ''}`}
                        onClick={() => onPageChange(pageNum)}
                        disabled={currentPage === pageNum}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                        {pageNum}
                    </button>
                )
            )}

            {/* Кнопка "Вперед" */}
            <button
                className={`${styles.pageButton} ${styles.arrowButton}`}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Следующая страница"
            >
                {'>'}
            </button>
        </nav>
    );
};

// --- ДОБАВЛЕН ЭКСПОРТ ПО УМОЛЧАНИЮ ---
export default Pagination;
// --- КОНЕЦ ИСПРАВЛЕНИЯ ---