import { Card, CardContent, Typography } from '@mui/material'
import React from 'react'
import { TLip } from '../types/TLip.ts'

const SongLip: React.FC<TLip> = ({ name }) => {
    return (
        <Card>
            <CardContent>
                <Typography>
                    {name}
                </Typography>
            </CardContent>
        </Card>
    )
}

export default SongLip