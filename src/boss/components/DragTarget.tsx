import React, { useEffect, useRef } from 'react'
import { useDrop } from 'react-dnd'
import { List, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TLip } from '../../types/TLip.ts'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

type StyledItemsProps = {
    isOver: boolean
    isOverShallow: boolean
}

type StyledPlaceholderProps = {
    status: LipStatus
}

const StyledItems = styled.div<StyledItemsProps>`
    position: relative;
    height: 100%;
    border-radius: 4px;
    background-color: ${(props) => props.isOver ? 'whitesmoke' : 'transparent'};
    
    ${(props) => props.isOverShallow ? `
        > *:last-child > li::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background-color: blue;
        }
    ` : ''};
`

const StyledPlaceholder = styled.div<StyledPlaceholderProps>`
    position: absolute;
    left: 50%;
    ${((props) => props.status === LipStatus.LIVE ? 'top: 50%;' : 'bottom: 60vh;')};
    transform: translate(-50%, -50%);
    opacity: 0.5;
`

const getNumItems = (items: TLip[], status: LipStatus): number => {
    return items.filter((item) => item.status === status).length
}

const getTitleByStatus = (status: LipStatus): string => {
    switch (status) {
        case LipStatus.IDLE:
            return 'Neue Songlips'
        case LipStatus.STAGED:
            return 'Ausgewählte Songlips'
        case LipStatus.LIVE:
            return 'Action!'
        default:
            return 'unsupported status'
    }
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
            isOverShallow: monitor.isOver({ shallow: true }),
        }),
    }))

    return (
        <List sx={{ height: '100%' }}>
            <StyledItems
                ref={drop}
                isOver={collection.isOver}
                isOverShallow={collection.isOverShallow}
            >
                {children}

                {!Array.isArray(children) || children.length === 0 ? (
                    <StyledPlaceholder status={status}>
                        <Typography>
                            {getTitleByStatus(status)}
                        </Typography>
                    </StyledPlaceholder>
                ) : null}
            </StyledItems>
        </List>
    )
}

export default DragTarget