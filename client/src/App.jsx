import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import AnimeDetailPage from './pages/AnimeDetailPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { AuthProvider } from '/src/context/AuthContext.jsx';

// Заглушки
const ForumPage = () => <div style={{textAlign: 'center', padding: 'var(--spacing-16)'}}>Страница форума (в разработке)</div>;
const NotFoundPage = () => <div style={{textAlign: 'center', padding: 'var(--spacing-16)'}}>404 - Страница не найдена</div>;
const SettingsPage = () => <div style={{textAlign: 'center', padding: 'var(--spacing-16)'}}>Страница настроек (в разработке)</div>; // <<<--- ВОЗВРАЩАЕМ ЗАГЛУШКУ


function App() {
    return (
        <AuthProvider>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/anime/:animeId/:slug?" element={<AnimeDetailPage />} />
                    <Route path="/forum" element={<ForumPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/profile/:tagPart" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} /> {/* <<<--- ВОЗВРАЩАЕМ РОУТ */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Layout>
        </AuthProvider>
    );
}

export default App;