import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Header.module.css';
import UserIcon from '../../assets/icons/UserIcon';
import ProfileIcon from '../../assets/icons/ProfileIcon';
import LogoutIcon from '../../assets/icons/LogoutIcon';
import SettingsIcon from '../../assets/icons/SettingsIcon'; // <<<--- ВОЗВРАЩАЕМ ИМПОРТ
import { useAuth } from '/src/context/AuthContext.jsx';

const Header = () => {
    const { isAuthenticated, user, logout, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const renderUserActions = () => {
        if (isLoading) {
            return <div className={styles.loadingPlaceholder}></div>;
        }

        if (isAuthenticated && user) {
            const profileUrlTagPart = user.tag ? user.tag.substring(1) : '';
            const displayName = user.nickname || user.tag;

            return (
                <div className={styles.userMenuContainer} ref={menuRef}>
                    <button
                        className={styles.userMenuButton}
                        aria-label="Меню пользователя"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-expanded={isMenuOpen}
                        type="button"
                    >
                        <UserIcon className={styles.userIcon} />
                        <span className={styles.nickname}>{displayName}</span>
                        <span className={`${styles.arrow} ${isMenuOpen ? styles.arrowUp : ''}`}>▼</span>
                    </button>
                    <div className={`${styles.dropdownMenuWrapper} ${isMenuOpen ? styles.dropdownMenuWrapperVisible : ''}`}>
                        <div className={styles.dropdownMenu}>
                            <Link to={`/profile/${profileUrlTagPart}`} className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                <ProfileIcon className={styles.dropdownIcon} />
                                <span>Профиль</span>
                            </Link>
                            {/* --- ВОЗВРАЩАЕМ ПУНКТ НАСТРОЕК --- */}
                            <Link to={`/settings`} className={styles.dropdownItem} onClick={() => setIsMenuOpen(false)}>
                                <SettingsIcon className={styles.dropdownIcon} />
                                <span>Настройки</span>
                            </Link>
                            {/* --- КОНЕЦ ВОЗВРАЩЕНИЯ --- */}
                            <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                                <LogoutIcon className={styles.dropdownIcon} />
                                <span>Выход</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <>
                    <NavLink to="/login" className={`${styles.navLink} ${styles.authLink}`}>Вход</NavLink>
                    <NavLink to="/register" className={styles.registerButton}>Регистрация</NavLink>
                </>
            );
        }
    }

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <NavLink to="/" className={styles.logo}> Ya<span className={styles.logoAccent}>Anime</span> </NavLink>
                <nav className={styles.nav}>
                    <NavLink to="/catalog" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}> Каталог </NavLink>
                    <NavLink to="/forum" className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}> Форум </NavLink>
                </nav>
                <div className={styles.userActions}> {renderUserActions()} </div>
            </div>
        </header>
    );
};

export default Header;