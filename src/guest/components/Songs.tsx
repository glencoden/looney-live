import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import React, { useCallback } from 'react'
import { TLip } from '../../types/TLip.ts'
import { TSong } from '../../types/TSong.ts'

type Props = {
    songs: TSong[]
    onSonglipCreated: (lip: TLip) => void
}

const Songs: React.FC<Props> = ({ songs, onSonglipCreated }) => {
    const onSongSelect = useCallback((song: TSong) => {
        console.log('song selected', song)
        // TODO: create songlip with overlay inputs
    }, [ onSonglipCreated ])

    return (
        <div>
            <Typography
                variant="h5"
                sx={{ padding: 3 }}
            >
                Wähle einen Songs aus
            </Typography>

            {songs.map((song) => (
                <Button
                    key={song.id}
                    onClick={() => onSongSelect(song)}
                >
                    {`${song.artist} - ${song.title}`}
                </Button>
            ))}
        </div>
    )
}

export default Songs