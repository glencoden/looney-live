import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useState } from 'react'
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

const App: React.FC = () => {
    const [ sessionId, setSessionId ] = useState<TSession['id'] | null>(null)
    const [ songs, setSongs ] = useState<TSong[] | null>()
    const [ lips, setLips ] = useState<TLip[] | null>(null)

    const [ activeTab, setActiveTab ] = useState(0)

    const [ selectedSong, setSelectedSong ] = useState<TSong | null>(null)

    // Wake lock

    useWakeLock(1000 * 60 * 3)

    // Join session

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)

        const sessionGuid = urlParams.get('session')

        console.log('session guid from params', sessionGuid)

        if (sessionGuid === null || sessionGuid.length === 0) {
            return
        }

        storageService.setSessionGuid(sessionGuid)

        history.replaceState({}, document.title, location.origin) // remove session guid url parameter after it's been stored

        const onSessionStart = () => {
            const sessionGuid = storageService.getSessionGuid()
            const guestGuid = storageService.getGuestGuid()

            if (sessionGuid.length === 0) {
                // TODO: handle this case properly
                return
            }

            requestService.getGuestData(sessionGuid, guestGuid)
                .then((result) => {
                    if (result.data === null) {
                        console.log(result.error)
                        return
                    }

                    storageService.setGuestGuid(result.data.guid)

                    setSessionId(result.data.sessionId)
                    setSongs(result.data.songs)
                    setLips(result.data.lips)
                })
        }

        onSessionStart()

        // TODO: poll socket
        const socket = requestService.getSocket()

        if (socket === null) {
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

        socket.emit(SocketEvents.GUEST_SERVER_JOIN, storageService.getGuestGuid()) // connect guest guid to socket
    }, [ setSongs, setLips ])

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
    }, [ setLips, setActiveTab, setSelectedSong ])

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
