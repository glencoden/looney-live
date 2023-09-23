import React, { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { List } from '@mui/material'
import styled from '@emotion/styled'
import { TLip } from '../../types/TLip.ts'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

type StyledProps = {
    isOver: boolean
}

const Styled = styled.div<StyledProps>`
    height: 100%;
    border-radius: 4px;
    background-color: ${(props) => props.isOver ? 'whitesmoke' : 'transparent'};
`

const getNumItems = (items: TLip[], status: LipStatus): number => {
    return items.filter((item) => item.status === status).length
}

type Props = {
    status: LipStatus
    items: TLip[]
    children?: React.ReactNode
}

const DragTarget: React.FC<Props> = ({ status, items, children }) => {
    const numItemsRef = useRef(getNumItems(items, status))

    useEffect(() => {
        numItemsRef.current = getNumItems(items, status)
    }, [ status, items ])

    const [ collection, drop ] = useDrop(() => ({
        accept: DragItemType.LIP,
        drop: (_, monitor) => {
            if (!monitor.isOver({ shallow: true })) {
                return
            }
            return { status, index: numItemsRef.current }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }))

    return (
        <List sx={{ height: '100%' }}>
            <Styled
                ref={drop}
                isOver={collection.isOver}
            >
                {children}
            </Styled>
        </List>
    )
}

export default DragTarget