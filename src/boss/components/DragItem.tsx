import styled from '@emotion/styled'
import { ListItem } from '@mui/material'
import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { TLip } from '../../types/TLip.ts'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

type StyledWrapperProps = {
    isDragging: boolean
}

type StyledDropAreaProps = {
    isOver: boolean
}

const StyledWrapper = styled.div<StyledWrapperProps>`
    position: relative;
    opacity: ${(props) => props.isDragging ? 0.5 : 1};
`

const StyledDropAreaTop = styled.div<StyledDropAreaProps>`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 50%;
    border-top: ${(props) => props.isOver ? '2px solid blue' : '2px solid transparent'};
`

const StyledDropAreaBottom = styled.div<StyledDropAreaProps>`
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50%;
    border-bottom: ${(props) => props.isOver ? '2px solid blue' : '2px solid transparent'};
`

type Props = {
    item: TLip
    setItems: React.Dispatch<React.SetStateAction<TLip[]>>
    children?: React.ReactNode
}

type DropResult = {
    status: LipStatus
    index: number
} | undefined

const DragItem: React.FC<Props> = ({ item, setItems, children }) => {
    const [ dropTopCollection, dropTop ] = useDrop({
        accept: DragItemType.LIP,
        drop: () => ({
            status: item.status,
            index: item.index,
        }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    const [ dropBottomCollection, dropBottom ] = useDrop({
        accept: DragItemType.LIP,
        drop: () => ({
            status: item.status,
            index: item.index + 1,
        }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    const [ dragCollection, drag ] = useDrag(() => ({
        type: DragItemType.LIP,
        item,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult() as DropResult

            if (
                !dropResult ||
                (
                    dropResult.status === item.status &&
                    (dropResult.index === item.index || dropResult.index === item.index + 1)
                )
            ) {
                return
            }

            setItems((prevItems) => {
                if (prevItems.findIndex((prevItem) => prevItem.status === LipStatus.LIVE) > -1 && dropResult.status === LipStatus.LIVE) {
                    return prevItems
                }

                return prevItems.map((prevItem) => {
                    if (prevItem.id === item.id) {
                        return {
                            ...prevItem,
                            status: dropResult.status,
                            index: dropResult.index,
                        }
                    }

                    let index = prevItem.index

                    // Current item is in the changed list and follows the updated item
                    if (prevItem.status === dropResult.status && prevItem.index >= dropResult.index) {
                        index++

                        // Updated item is also in the changed list and the current item is at or beyond its previous position
                        if (item.status === dropResult.status && prevItem.index >= item.index) {
                            index--
                        }
                        // Current item is in the list from which the updated item was removed and is at or beyond its previous position
                    } else if (prevItem.status === item.status && prevItem.index >= item.index) {
                        index--
                    }

                    return {
                        ...prevItem,
                        index,
                    }
                })
            })
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))

    return (
        <StyledWrapper
            ref={drag}
            isDragging={dragCollection.isDragging}
        >
            <ListItem>
                {children}
            </ListItem>

            <StyledDropAreaTop
                ref={dropTop}
                isOver={dropTopCollection.isOver}
            />
            <StyledDropAreaBottom
                ref={dropBottom}
                isOver={dropBottomCollection.isOver}
            />
        </StyledWrapper>
    )
}

export default DragItem