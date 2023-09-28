import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import React, { useEffect, useState } from 'react'
import { requestService } from '../services/requestService.ts'
import { TLip } from '../types/TLip.ts'
import { TSong } from '../types/TSong.ts'
import formatDistance from 'date-fns/formatDistance'
import { de } from 'date-fns/locale'

export const SONG_LIP_WIDTH = 360

const getTimeDistance = (date: string): string => {
    return formatDistance(new Date(date), new Date(), { addSuffix: true, locale: de })
}

const SongLip: React.FC<TLip> = ({ songId, date, name }) => {
    const [ timeDistance, setTimeDistance ] = useState(() => getTimeDistance(date))
    const [ song, setSong ] = useState<TSong | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeDistance(getTimeDistance(date))
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [ date, setTimeDistance ])

    useEffect(() => {
        requestService.getSong(songId)
            .then((response) => {
                setSong(response.data[0])
            })
    }, [ songId, setSong ])

    return (
        <Card sx={{ width: `${SONG_LIP_WIDTH}px` }}>
            <CardContent>
                {song === null ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography
                            variant="caption"
                            color="secondary"
                            sx={{ float: 'right' }}
                        >
                            {timeDistance}
                        </Typography>

                        <Typography variant="overline">
                            {name}
                        </Typography>

                        <Typography>
                            {song.artist} - {song.title}{song.title}
                        </Typography>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default SongLip