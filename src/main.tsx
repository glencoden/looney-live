import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <QueryClientProvider client={queryClient}>
                {import.meta.env.VITE_BUILD_TYPE === 'boss' && <AppBoss />}
                {import.meta.env.VITE_BUILD_TYPE === 'guest' && <AppGuest />}

                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    </React.StrictMode>,
)
