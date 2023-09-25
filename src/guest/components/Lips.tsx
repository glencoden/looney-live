import React from 'react'
import { TLip } from '../../types/TLip.ts'
import SongLip from '../../ui/SongLip.tsx'

type Props = {
    lips: TLip[]
}

const Lips: React.FC<Props> = ({ lips }) => {
    return (
        <div>
            {lips.map((lip) => (
                <SongLip key={lip.id} {...lip} />
            ))}
        </div>
    )
}

export default Lips