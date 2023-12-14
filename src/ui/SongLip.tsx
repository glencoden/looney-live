import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import React, { useEffect, useState } from 'react'
import { LipStatus } from '../boss/enums/LipStatus.ts'
import { requestService } from '../services/requestService.ts'
import { TLip } from '../types/TLip.ts'
import { TSong } from '../types/TSong.ts'
import formatDistance from 'date-fns/formatDistance'
import { de } from 'date-fns/locale'

export const SONG_LIP_WIDTH = 360

const getTimeDistance = (date: Date): string => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: de })
}

const SongLip: React.FC<TLip> = ({ songId, updatedAt, guestName, status, message }) => {
    const [ timeDistance, setTimeDistance ] = useState(() => getTimeDistance(updatedAt))
    const [ song, setSong ] = useState<TSong | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeDistance(getTimeDistance(updatedAt))
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [ updatedAt ])

    useEffect(() => {
        requestService.getSong(songId)
            .then((response) => {
                setSong(response.data[0])
            })
    }, [ songId ])

    const isGuestLiveCall = import.meta.env.VITE_BUILD_TYPE === 'guest' && status === LipStatus.LIVE

    return (
        <Card
            sx={{
                width: `${SONG_LIP_WIDTH}px`,
                border: isGuestLiveCall ? '2px solid deeppink' : 'none',
                userSelect: 'none',
            }}
        >
            <CardContent>
                {song === null ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {isGuestLiveCall && (
                            <>
                                <Typography
                                    sx={{ marginBottom: 1, color: 'deeppink' }}
                                    variant="h3"
                                >
                                    Du bist dran!</Typography>
                                <Divider sx={{ marginBottom: 1 }} />
                            </>
                        )}

                        {status === LipStatus.DELETED && (
                            <>
                                <Typography
                                    sx={{ marginBottom: 1 }}
                                    color="error"
                                >
                                    Gelöscht
                                </Typography>
                                <Typography
                                    sx={{ marginBottom: 1 }}
                                    variant="body2"
                                >
                                    {message}
                                </Typography>
                                <Divider sx={{ marginBottom: 1 }} />
                            </>
                        )}

                        {status === LipStatus.DONE && (
                            <>
                                <Typography sx={{ marginBottom: 1 }}>
                                    Das war stark!
                                </Typography>
                                <Typography
                                    sx={{ marginBottom: 1 }}
                                    variant="body2"
                                >
                                    Vielen Dank für deine heiße Performance, wir können es kaum abwarten, dich wieder auf der Bühne zu sehen.
                                </Typography>
                                <Divider sx={{ marginBottom: 1 }} />
                            </>
                        )}

                        <Typography
                            variant="caption"
                            color="secondary.dark"
                            sx={{ float: 'right' }}
                        >
                            {timeDistance}
                        </Typography>

                        <Typography variant="overline">
                            {guestName}
                        </Typography>

                        <Typography sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {song.artist} - {song.title}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default SongLip