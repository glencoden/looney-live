import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LipStatus } from '../boss/enums/LipStatus.ts'
import { SocketEvents } from '../enums/SocketEvents.ts'
import useWakeLock from '../hooks/useWakeLock.ts'
import { requestService } from '../services/requestService.ts'
import { storageService } from '../services/storageService.ts'
import { TLip } from '../types/TLip.ts'
import { TSession } from '../types/TSession.ts'
import { TSong } from '../types/TSong.ts'
import LipEditor from './components/LipEditor.tsx'
import Lips from './components/Lips.tsx'
import Songs from './components/Songs.tsx'

const SESSION_REFETCH_INTERVAL = 1000 * 60

const App: React.FC = () => {
    const [ sessionId, setSessionId ] = useState<TSession['id'] | null>(null)
    const [ songs, setSongs ] = useState<TSong[] | null>()
    const [ lips, setLips ] = useState<TLip[] | null>(null)

    const [ activeTab, setActiveTab ] = useState(0)

    const [ selectedSong, setSelectedSong ] = useState<TSong | null>(null)

    // Wake lock

    useWakeLock(1000 * 60 * 3)

    // Sign up for session, receive guest guid

    const sessionStartTimeoutIdRef = useRef<number | undefined>()

    useEffect(() => {
        // Set session guid from url parameter to local storage

        const urlParams = new URLSearchParams(location.search)

        const sessionGuid = urlParams.get('session')

        if (sessionGuid !== null && sessionGuid.length > 0) {
            storageService.setSessionGuid(sessionGuid)

            history.replaceState({}, document.title, location.origin) // remove session guid url parameter after it's been stored
        }

        // Open socket if it isn't already open

        let socket = requestService.getSocket()

        const isSocketAlreadyOpen = socket !== null

        if (!isSocketAlreadyOpen) {
            socket = requestService.openSocket()
        }

        // Session start callback

        const onSessionStart = () => {
            clearTimeout(sessionStartTimeoutIdRef.current)

            const sessionGuid = storageService.getSessionGuid()
            const guestGuid = storageService.getGuestGuid()

            if (sessionGuid.length === 0) {
                // TODO: handle this case properly
                return
            }

            sessionStartTimeoutIdRef.current = setTimeout(onSessionStart, SESSION_REFETCH_INTERVAL)

            requestService.getGuestData(sessionGuid, guestGuid)
                .then((result) => {
                    // no data if session isn't running yet
                    if (result.data === null) {
                        return
                    }

                    storageService.setGuestGuid(result.data.guid)

                    setSessionId(result.data.sessionId)
                    setSongs(result.data.songs)
                    setLips(result.data.lips)
                })
        }

        onSessionStart()

        // Add socket listeners if it isn't already open

        if (isSocketAlreadyOpen || socket === null) {
            return
        }

        socket.on(SocketEvents.SERVER_ALL_SESSION_START, onSessionStart)

        socket.on(SocketEvents.SERVER_ALL_SESSION_END, () => {
            setSessionId(null)
            setSongs(null)
            setLips(null)
        })

        socket.on(SocketEvents.SERVER_GUEST_UPDATE_LIP, (lip: TLip) => {
            // TODO: trigger stage call

            setLips((prevLips) => {
                if (prevLips === null) {
                    return null
                }
                return prevLips.map((prevLip) => {
                    if (prevLip.id === lip.id) {
                        return lip
                    }
                    return prevLip
                })
            })
        })
    }, [])

    // maps guest guid to socket
    useEffect(() => {
        if (sessionId === null) {
            return
        }

        const socket = requestService.getSocket()

        if (socket === null) {
            return
        }

        // join at random point to reduce number of simultaneous requests of all waiting guests
        const randomTimeout = Math.round(Math.random() * 1000 * 5)

        const timeoutId = setTimeout(() => {
            socket.emit(SocketEvents.GUEST_SERVER_JOIN, storageService.getGuestGuid())
        }, randomTimeout)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [ sessionId ])

    const onSongSelect = useCallback((song: TSong) => {
        const selectedLips = lips?.filter((lip) => lip.status !== LipStatus.DONE && lip.status !== LipStatus.DELETED)

        if (
            selectedLips &&
            (
                selectedLips.length >= 3 ||
                selectedLips.find((lip) => lip.songId === song.id)
            )
        ) {
            return
        }

        setSelectedSong(song)
    }, [ lips ])

    const onLipEdited = useCallback((lip: TLip | null) => {
        if (lip !== null) {
            setLips((prevLips) => [ ...(prevLips ?? []), lip ]) // TODO: add edit functionality
            setActiveTab(1)
        }
        setSelectedSong(null)
    }, [])

    if (sessionId === null) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100dvh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3,
                    padding: 5,
                }}
            >
                <Typography variant="h5">Schön dass du dabei bist!</Typography>
                <Typography>Die Session fängt bald an.</Typography>
            </Box>
        )
    }

    if (selectedSong !== null) {
        return (
            <LipEditor
                song={selectedSong}
                onLipEdited={onLipEdited}
            />
        )
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box
                sx={{
                    width: 'min(420px, 100vw)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_event, newValue) => setActiveTab(newValue)}
                    >
                        <Tab label="Songs" />
                        <Tab label="Lips" />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <Songs
                        songs={songs ?? []}
                        onSongSelect={onSongSelect}
                    />
                )}

                {activeTab === 1 && (
                    <Lips
                        lips={lips ?? []}
                    />
                )}
            </Box>
        </Box>
    )
}

export default App
