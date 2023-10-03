import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import AppBoss from './boss/App.tsx'
import AppGuest from './guest/App.tsx'
import './index.css'

const theme = createTheme({
    typography: {
        fontFamily: 'Poppins, Arial',
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#0C5EF0',
        },
        secondary: {
            main: '#F0EC00',
            dark: '#DD137B',
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            {import.meta.env.VITE_BUILD_TYPE === 'boss' && <AppBoss />}
            {import.meta.env.VITE_BUILD_TYPE === 'guest' && <AppGuest />}
        </ThemeProvider>
    </React.StrictMode>,
)
