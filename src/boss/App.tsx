import LogoutIcon from '@mui/icons-material/Logout'
import LoginIcon from '@mui/icons-material/Login'
import ListIcon from '@mui/icons-material/List'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'
import { SocketBossToServer } from '../enums/SocketBossToServer.ts'
import { SocketServerToBoss } from '../enums/SocketServerToBoss.ts'
import useWakeLock from '../hooks/useWakeLock.ts'
import { requestService } from '../services/requestService.ts'
import { TLip } from '../types/TLip.ts'
import SongLip, { SONG_LIP_WIDTH } from '../ui/SongLip.tsx'
import DragItem from './components/DragItem.tsx'
import DropTarget from './components/DropTarget.tsx'
import SessionPicker from './components/SessionPicker.tsx'
import { LipStatus } from './enums/LipStatus.ts'
import { isIPad } from './helpers/isIPad.ts'
import { useLipsQuery } from './requests/queries/useLipsQuery.ts'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'

const dndBackend = isIPad() ? TouchBackend : HTML5Backend

const prepareItems = (items: TLip[], filter: LipStatus): TLip[] => {
    return items
        .filter((item) => item.status === filter)
        .sort((a, b) => a.index - b.index)
}

const START_FIELD_HEIGHT = 124

enum LoggedOutView {
    LIPS = 'lips',
    LOGIN = 'login',
}

enum LoggedInView {
    LIVE = 'live',
    SESSION_PICKER = 'session-picker',
}

const App: React.FC = () => {
    // Lips list, extendable by socket payload

    const [ items, setItems ] = useState<TLip[]>([])

    // Login form data

    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
    const [ isLoggedIn, setIsLoggedIn ] = useState(false)

    // Router

    const [ loggedOutView, setLoggedOutView ] = useState<LoggedOutView>(LoggedOutView.LOGIN)
    const [ loggedInView, setLoggedInView ] = useState<LoggedInView>(LoggedInView.LIVE)

    // Reset routes when login status changes
    useEffect(() => {
        setLoggedOutView(LoggedOutView.LOGIN)
        setLoggedInView(LoggedInView.LIVE)
    }, [ isLoggedIn ])

    // Wake lock

    useWakeLock(1000 * 60 * 60)

    // Unload lock

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.returnValue = `Willst du die Seite wirklich verlassen?`
        }

        window.addEventListener('beforeunload', onBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload)
        }
    }, [])

    // Web socket

    useEffect(() => {
        const socket = requestService.getSocket()

        if (socket === null) {
            return
        }

        socket.emit(SocketBossToServer.BOSS_JOIN)

        socket.on(SocketServerToBoss.ADD_LIP, (lip: TLip) => {
            setItems((prevItems) => [ ...prevItems, lip ])
        })
    }, [ setItems ])

    // GET lips

    const { data: lipsResult, isLoading } = useLipsQuery()

    const lips = lipsResult?.data?.lips ?? null

    if (lips !== null && lips !== items) {
        setItems(lips)
    }

    // Login callbacks

    const onLogin = useCallback((username: string, password: string) => {
        setErrorMessage(null)

        requestService.login(username, password)
            .then((isLoggedIn) => {
                setUsername('')
                setPassword('')
                setIsLoggedIn(isLoggedIn)
            })
            .catch((err) => {
                console.warn(err)
                setErrorMessage('Das hat nicht geklappt.')
            })
    }, [ setErrorMessage, setIsLoggedIn ])

    const onLogout = useCallback(() => {
        const isLoggedOut = requestService.logout()
        if (!isLoggedOut) {
            console.warn('Logout failed.')
            return
        }
        setIsLoggedIn(false)
    }, [ setIsLoggedIn ])

    useEffect(() => {
        const reference: { timeoutId: ReturnType<typeof setTimeout> | undefined } = {
            timeoutId: undefined,
        }

        const checkLogin = () => {
            setIsLoggedIn(requestService.isLoggedIn())

            reference.timeoutId = setTimeout(checkLogin, 1000 * 15)
        }

        checkLogin()

        return () => clearTimeout(reference.timeoutId)
    }, [])

    // UI

    if (isLoading) {
        return (
            <Box sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!isLoggedIn) {
        const ViewNav = () => (
            <Box
                sx={{
                    width: '100%',
                    position: 'fixed',
                    zIndex: '1000',
                    display: 'flex',
                    justifyContent: 'end',
                    padding: 2,
                }}
            >
                <IconButton
                    color={loggedOutView === LoggedOutView.LIPS ? 'primary' : 'default'}
                    onClick={() => setLoggedOutView(LoggedOutView.LIPS)}
                >
                    <ListIcon />
                </IconButton>

                <IconButton
                    color={loggedOutView === LoggedOutView.LOGIN ? 'primary' : 'default'}
                    onClick={() => setLoggedOutView(LoggedOutView.LOGIN)}
                >
                    <LoginIcon />
                </IconButton>
            </Box>
        )

        switch (loggedOutView) {
            case LoggedOutView.LIPS:
                return (
                    <>
                        <ViewNav />

                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            {items.length === 0
                                ? (
                                    <Box sx={{ height: '100dvh', display: 'flex', alignItems: 'center' }}>
                                        <Typography>Noch keine Lips</Typography>
                                    </Box>
                                )
                                : items.map((item) => (
                                    <List>
                                        <ListItem key={item.id}>
                                            <SongLip {...item} />
                                        </ListItem>
                                    </List>
                                ))
                            }
                        </Box>
                    </>
                )
            case LoggedOutView.LOGIN:
                return (
                    <>
                        <ViewNav />

                        <Box
                            component="form"
                            sx={{
                                '& .MuiTextField-root': { m: 1, width: '25ch' },
                                height: '70dvh',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                            noValidate
                            autoComplete="off"
                        >
                            <TextField
                                label="Username"
                                autoFocus={true}
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                error={errorMessage !== null}
                            />

                            <TextField
                                label="Passwort"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                error={errorMessage !== null}
                                helperText={errorMessage}
                            />

                            <Button
                                variant="contained"
                                sx={{ marginTop: 5 }}
                                onClick={() => onLogin(username, password)}
                            >
                                Login
                            </Button>
                        </Box>
                    </>
                )
        }
    }

    const ViewNavButtons = () => (
        <>
            <IconButton
                color={loggedInView === LoggedInView.LIVE ? 'primary' : 'default'}
                onClick={() => setLoggedInView(LoggedInView.LIVE)}
            >
                <PlayCircleOutlineIcon />
            </IconButton>

            <IconButton
                color={loggedInView === LoggedInView.SESSION_PICKER ? 'primary' : 'default'}
                onClick={() => setLoggedInView(LoggedInView.SESSION_PICKER)}
            >
                <EditCalendarIcon />
            </IconButton>

            <IconButton
                aria-label="delete"
                onClick={onLogout}
            >
                <LogoutIcon />
            </IconButton>
        </>
    )

    // TODO: Refactor nav UI to not have to guess positioning like 784px containers
    if (loggedInView === LoggedInView.SESSION_PICKER) {
        return (
            <>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: '784px',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            gap: 1,
                            height: `${START_FIELD_HEIGHT}px`,
                            padding: '0 16px',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <ViewNavButtons />
                    </Box>
                </Box>

                <SessionPicker />
            </>
        )
    }

    return (
        <DndProvider backend={dndBackend}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                <Box sx={{ width: '820px', display: 'flex', justifyContent: 'center' }}>

                    {/* LEFT */}

                    <Box
                        sx={{
                            position: 'relative',
                            width: `${SONG_LIP_WIDTH + 32}px`,
                            height: '100dvh',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box
                            sx={{
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `${START_FIELD_HEIGHT}px`,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <DropTarget status={LipStatus.LIVE}>
                                {prepareItems(items, LipStatus.LIVE).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DropTarget>
                        </Box>

                        <Divider />

                        <Box
                            sx={{
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `calc(100dvh - ${START_FIELD_HEIGHT}px)`,
                                bgcolor: 'background.paper',
                                overflow: 'scroll',
                            }}
                        >
                            <DropTarget status={LipStatus.STAGED}>
                                {prepareItems(items, LipStatus.STAGED).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DropTarget>
                        </Box>

                        <Box
                            sx={{
                                position: 'absolute',
                                right: '100%',
                                top: '0',
                                width: '50vw',
                                height: '100dvh',
                            }}
                        >
                            <DropTarget status={LipStatus.DONE} />
                        </Box>
                    </Box>

                    {/* RIGHT */}

                    <Box
                        sx={{
                            position: 'relative',
                            width: `${SONG_LIP_WIDTH + 32}px`,
                            height: '100dvh',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                gap: 1,
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `${START_FIELD_HEIGHT}px`,
                                padding: '0 16px',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <ViewNavButtons />
                        </Box>

                        <Divider sx={{ backgroundColor: 'white', borderColor: 'white' }} />

                        <Box
                            sx={{
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `calc(100dvh - ${START_FIELD_HEIGHT}px)`,
                                bgcolor: 'background.paper',
                                overflow: 'scroll',
                            }}
                        >
                            <DropTarget status={LipStatus.IDLE}>
                                {prepareItems(items, LipStatus.IDLE).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DropTarget>
                        </Box>

                        <Box sx={{ position: 'absolute', left: '100%', top: '0', width: '50vw', height: '100dvh' }}>
                            <DropTarget status={LipStatus.DELETED} />
                        </Box>
                    </Box>

                </Box>
            </Box>
        </DndProvider>
    )
}

export default App
