import React from 'react'
import { useDrop } from 'react-dnd'
import { List } from '@mui/material'
import styled from '@emotion/styled'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

const Styled = styled.div`
    background-color: ${(props) => props.isOver ? 'lime' : 'transparent'};
`

type Props = {
    status: LipStatus
}

const DragTarget: React.FC<Props> = ({ status, children }) => {
    const [ collection, drop ] = useDrop(() => ({
        accept: DragItemType.LIP,
        drop: () => ({ status }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }))

    return (
        <List>
            <Styled
                ref={drop}
                isOver={collection.isOver}
            >
                {collection.canDrop ? 'Release to drop' : 'Drag a box here'}
                {children}
            </Styled>
        </List>
    )
}

export default DragTarget