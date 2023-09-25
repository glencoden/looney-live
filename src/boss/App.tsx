import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import LogoutIcon from '@mui/icons-material/Logout'
import React, { useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import { requestService } from '../services/requestService.ts'
import { TLip } from '../types/TLip.ts'
import SongLip, { SONG_LIP_WIDTH } from '../ui/SongLip.tsx'
import DragItem from './components/DragItem.tsx'
import DropTarget from './components/DropTarget.tsx'
import { LipStatus } from './enums/LipStatus.ts'

const filterItems = (items: TLip[], filter: LipStatus): TLip[] => {
    return items
        .filter((item) => item.status === filter)
        .sort((a, b) => a.index - b.index)
}

const START_FIELD_HEIGHT = 100

const App: React.FC = () => {
    const [ items, setItems ] = useState([
        { id: 1, name: 'glen', status: LipStatus.IDLE, index: 0 },
        { id: 2, name: 'coden', status: LipStatus.IDLE, index: 1 },
        { id: 3, name: 'shingle', status: LipStatus.IDLE, index: 2 },
    ] as unknown as TLip[])

    // 'http://localhost:5555/live/test'

    const [ password, setPassword ] = useState('')
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
    const [ isLoggedIn, setIsLoggedIn ] = useState(false)

    const onLogin = useCallback((pw: string) => {
        setErrorMessage(null)

        requestService.login('boss', pw)
            .then(setIsLoggedIn)
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
        setPassword('')
        setIsLoggedIn(false)
    }, [ setPassword, setIsLoggedIn ])

    useEffect(() => {
        const reference: { timeoutId: ReturnType<typeof setTimeout> | undefined } = {
            timeoutId: undefined,
        }

        const checkLogin = () => {
            setIsLoggedIn(requestService.isLoggedIn())

            reference.timeoutId = setTimeout(checkLogin, 1000)
        }

        checkLogin()

        return () => clearTimeout(reference.timeoutId)
    }, [ setIsLoggedIn ])

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
                    gap: '32px',
                }}
                noValidate
                autoComplete="off"
            >
                <TextField
                    id="outlined-error"
                    label="Passwort"
                    type="password"
                    autoFocus={true}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    error={errorMessage !== null}
                    helperText={errorMessage}
                />

                <Button
                    variant="contained"
                    onClick={() => onLogin(password)}
                >
                    Login
                </Button>
            </Box>
        )
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
                                        setItems={setItems}
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
                                        setItems={setItems}
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
                                        setItems={setItems}
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
