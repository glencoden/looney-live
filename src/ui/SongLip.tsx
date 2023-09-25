import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
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