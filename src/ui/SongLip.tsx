import { Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { TLip } from '../types/TLip.ts'

export const SONG_LIP_WIDTH = 360

const SongLip: React.FC<TLip> = ({ name }) => {
    return (
        <Card sx={{ width: `${SONG_LIP_WIDTH}px` }}>
            <CardContent>
                <Typography>
                    {name}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default SongLip