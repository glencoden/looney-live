import Typography from '@mui/material/Typography'
import React, { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
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

    // TODO: connect to socket to receive lip status updates

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
