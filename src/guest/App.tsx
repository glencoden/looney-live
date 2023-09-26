import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useState } from 'react'
import { LipStatus } from '../boss/enums/LipStatus.ts'
import { requestService } from '../services/requestService.ts'
import { storageService } from '../services/storageService.ts'
import { TLip } from '../types/TLip.ts'
import { TSong } from '../types/TSong.ts'
import LipEditor from './components/LipEditor.tsx'
import Lips from './components/Lips.tsx'
import Songs from './components/Songs.tsx'

const App: React.FC = () => {
    const [ sessionId, setSessionId ] = useState<number | null>(null)
    const [ songs, setSongs ] = useState<TSong[] | null>()
    const [ lips, setLips ] = useState<TLip[] | null>(null)

    const [ activeTab, setActiveTab ] = useState(0)

    const [ selectedSong, setSelectedSong ] = useState<TSong | null>(null)

    useEffect(() => {
        const guestGuid = storageService.getGuestGuid()

        requestService.getGuestData(guestGuid)
            .then((response) => {
                if (!response.success || !response.data) {
                    console.log(response.message)
                    return
                }
                storageService.setGuestGuid(response.data.guid)

                setSessionId(response.data.sessionId)
                setSongs(response.data.songs)
                setLips(response.data.lips)
            })
    }, [ setSessionId, setSongs, setLips ])

    useEffect(() => {
        const socket = requestService.getSocket()

        if (socket === null || sessionId === null) {
            return
        }

        socket.emit('join', storageService.getGuestGuid())

        socket.on('update-lip', (lip: TLip) => {
            setLips((prevLips) => {
                if (prevLips === null) {
                    return null
                }
                const index = prevLips.findIndex((prevLip) => prevLip.id === lip.id)

                if (index === -1) {
                    return prevLips
                }

                if (lip.status === LipStatus.DONE) {
                    return prevLips.filter((prevLip) => prevLip.id !== lip.id)
                }

                if (lip.status === LipStatus.LIVE) {
                    // TODO: trigger stage call!
                }
                const update = [ ...prevLips ]

                update[index] = lip

                return update
            })
        })

        socket.on('delete-lip', (params: { data: TLip, message: string }) => {
            setLips((prevLips) => {
                if (prevLips === null) {
                    return null
                }

                return prevLips.filter((prevLip) => prevLip.id !== params.data.id)
            })

            // TODO: prompt with message
        })
    }, [ sessionId, setLips ])

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
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Typography variant="h5">Die Session läuft noch nicht</Typography>
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
                        onSongSelect={setSelectedSong}
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
