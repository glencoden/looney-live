import React from 'react'
import { useDrop } from 'react-dnd'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import styled from '@emotion/styled'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

type StyledItemsProps = {
    status: LipStatus
    isOver: boolean
    isOverShallow: boolean
}

type StyledPlaceholderProps = {
    status: LipStatus
}

type Props = {
    status: LipStatus
    children?: React.ReactNode
}

const StyledItems = styled.div<StyledItemsProps>`
    position: relative;
    height: 100%;
    border-radius: 4px;
    background-color: ${(props) => props.isOver ? getHoverColorByStatus(props.status) : 'transparent'};

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

const getHoverColorByStatus = (status: LipStatus): string => {
    switch (status) {
        case LipStatus.DELETED:
            return 'red'
        case LipStatus.IDLE:
        case LipStatus.STAGED:
            return 'whitesmoke'
        case LipStatus.LIVE:
            return 'deeppink'
        case LipStatus.DONE:
            return 'blue'
    }
}

const getTitleByStatus = (status: LipStatus): string => {
    switch (status) {
        case LipStatus.DELETED:
            return 'Gelöscht'
        case LipStatus.IDLE:
            return 'Neue Songlips'
        case LipStatus.STAGED:
            return 'Ausgewählte Songlips'
        case LipStatus.LIVE:
            return 'Go!'
        case LipStatus.DONE:
            return 'Fertig'
    }
}

const DropTarget: React.FC<Props> = ({ status, children }) => {
    const [ collection, dropRef ] = useDrop(() => ({
        accept: DragItemType.LIP,
        drop: (_, monitor) => {
            if (!monitor.isOver({ shallow: true })) {
                return
            }
            return {
                status,
                index: Array.isArray(children) ? children.length : 0,
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            isOverShallow: monitor.isOver({ shallow: true }),
        }),
    }), [ children ])

    return (
        <List sx={{ height: '100%' }}>
            <StyledItems
                ref={dropRef}
                status={status}
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

export default DropTarget