import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import AppBoss from './boss/App.tsx'
import AppGuest from './guest/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {import.meta.env.VITE_BUILD_TYPE === 'boss' && <AppBoss />}
        {import.meta.env.VITE_BUILD_TYPE === 'guest' && <AppGuest />}
    </React.StrictMode>,
)
