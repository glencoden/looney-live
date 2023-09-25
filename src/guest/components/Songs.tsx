import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import React from 'react'
import { TSong } from '../../types/TSong.ts'

type Props = {
    songs: TSong[]
    onSongSelect: React.Dispatch<React.SetStateAction<TSong | null>>
}

const Songs: React.FC<Props> = ({ songs, onSongSelect }) => {
    return (
        <div>
            <Typography
                variant="h5"
                sx={{ padding: 3, paddingLeft: 2 }}
            >
                Wähle einen Songs aus
            </Typography>

            <List>
                {songs.map((song) => (
                    <ListItem
                        key={song.id}
                        onClick={() => onSongSelect(song)}
                    >
                        <Typography>
                            {`${song.artist} - ${song.title}`}
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </div>
    )
}

export default Songs