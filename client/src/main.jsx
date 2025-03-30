import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/global.css'
// import { AuthProvider } from '/src/context/AuthContext.jsx'; // <<<--- УБИРАЕМ ИМПОРТ И ПРОВАЙДЕР ОТСЮДА

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Не удалось найти корневой элемент с id 'root'");
}

ReactDOM.createRoot(rootElement).render(
    // <React.StrictMode>
    <BrowserRouter>
        {/* <AuthProvider> */}
        <App /> {/* <<<--- Рендерим App напрямую */}
        {/* </AuthProvider> */}
    </BrowserRouter>
    // </React.StrictMode>,
)