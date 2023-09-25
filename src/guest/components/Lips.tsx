import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import { TLip } from '../../types/TLip.ts'
import SongLip from '../../ui/SongLip.tsx'

type Props = {
    lips: TLip[]
}

const Lips: React.FC<Props> = ({ lips }) => {
    return (
        <List>
            {lips.map((lip) => (
                <ListItem key={lip.id}>
                    <SongLip {...lip} />
                </ListItem>
            ))}
        </List>
    )
}

export default Lips