import LogoutIcon from '@mui/icons-material/Logout'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
// import { HTML5Backend } from 'react-dnd-html5-backend'
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
import { useLipsQuery } from './requests/queries/useLipsQuery.ts'

const filterItems = (items: TLip[], filter: LipStatus): TLip[] => {
    return items
        .filter((item) => item.status === filter)
        .sort((a, b) => a.index - b.index)
}

const START_FIELD_HEIGHT = 124

const App: React.FC = () => {
    const [ items, setItems ] = useState<TLip[]>([])

    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
    const [ isLoggedIn, setIsLoggedIn ] = useState(false)

    // WAKE LOCK

    useWakeLock(1000 * 60 * 60)

    // UNLOAD LOCK

    useEffect(() => {
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.returnValue = `Willst du die Seite wirklich verlassen?`
        }

        window.addEventListener('beforeunload', onBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload)
        }
    }, [])

    // WEB SOCKET

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

    // GET LIPS

    const { data, isLoading } = useLipsQuery()

    console.log('lips query data', data)
    console.log('lips query isLoading', isLoading)
    // if items is not lips from data, set items

    // LOGIN

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

    if (!isLoggedIn) {
        return (
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
        )
    }

    // TODO: implement router

    if (true) {
        return <SessionPicker />
    }

    return (
        <DndProvider backend={TouchBackend}>
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
                                {filterItems(items, LipStatus.LIVE).map((item) => (
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
                                {filterItems(items, LipStatus.STAGED).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DropTarget>
                        </Box>

                        <Box sx={{ position: 'absolute', right: '100%', top: '0', width: '50vw', height: '100dvh' }}>
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
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `${START_FIELD_HEIGHT}px`,
                                padding: '0 16px',
                                bgcolor: 'background.paper',
                            }}
                        >
                            <IconButton
                                aria-label="delete"
                                onClick={onLogout}
                            >
                                <LogoutIcon />
                            </IconButton>
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
                                {filterItems(items, LipStatus.IDLE).map((item) => (
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
