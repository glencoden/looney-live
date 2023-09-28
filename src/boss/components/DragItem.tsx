import styled from '@emotion/styled'
import ListItem from '@mui/material/ListItem'
import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { requestService } from '../../services/requestService.ts'
import { TLip } from '../../types/TLip.ts'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'

const DELETE_MESSAGES = {
    TOO_OFTEN: 'Diesen Song haben wir heute schon zu oft gehört. Damit die Party abwechslungsreich bleibt, kommst du damit heute nicht dran.',
    TOO_LATE: 'Es gibt so viele Anmeldungen vor dir, dass wir es heute leider nicht schaffen, dich mit diesem Song auf die Bühne zu holen.',
    ERROR: 'Da stimmt doch was nicht, leider kannst du diesen Song heute nicht singen.',
}

type StyledWrapperProps = {
    isDragging: boolean
}

type StyledDropAreaProps = {
    isOver: boolean
}

type Props = {
    item: TLip
    setItems: React.Dispatch<React.SetStateAction<TLip[]>>
    children?: React.ReactNode
}

type DropResult = {
    status: LipStatus
    index: number
} | undefined

const StyledWrapper = styled.div<StyledWrapperProps>`
    position: relative;
    margin-bottom: -2px;

    ${(props) => props.isDragging ? `
        opacity: 0.5;
    
        > * {
            border: none !important;
        }
    ` : ''}
`

const StyledDropAboveArea = styled.div<StyledDropAreaProps>`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 50%;
    border-top: ${(props) => props.isOver ? '2px solid blue' : '2px solid transparent'};
`

const StyledDropBelowArea = styled.div<StyledDropAreaProps>`
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 50%;
    border-bottom: ${(props) => props.isOver ? '2px solid blue' : '2px solid transparent'};
`

const DragItem: React.FC<Props> = ({ item, setItems, children }) => {
    const [ dropAboveCollection, dropAboveRef ] = useDrop({
        accept: DragItemType.LIP,
        drop: () => ({
            status: item.status,
            index: item.index,
        }),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }, [ item ])

    const [ dropBelowCollection, dropBelowRef ] = useDrop({
        accept: DragItemType.LIP,
        drop: () => ({
            status: item.status,
            index: item.index + 1,
        }),
        collect: (monitor) => {
            return {
                isOver: monitor.isOver(),
                prevItem: monitor.getItem() as (TLip | undefined),
            }
        },
    }, [ item ])

    const [ dragCollection, dragRef ] = useDrag(() => ({
        type: DragItemType.LIP,
        item,
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult() as DropResult

            if (
                !dropResult ||
                (
                    dropResult.status === item.status &&
                    (dropResult.index === item.index)
                )
            ) {
                return
            }

            const dragIndex = item.index
            const dragStatus = item.status

            const dropIndex = dropResult.index
            const dropStatus = dropResult.status

            setItems((currentItems) => {
                console.log('drag', dragIndex, dragStatus)
                console.log('drop', dropIndex, dropStatus)
                console.log('items', JSON.stringify(currentItems, null, 4))

                if (
                    (dropStatus === LipStatus.LIVE && currentItems.findIndex((currentItem) => currentItem.status === LipStatus.LIVE) > -1) ||
                    (dropStatus === LipStatus.DONE && dragStatus !== LipStatus.LIVE)
                ) {
                    return currentItems
                }

                return currentItems.map((currentItem) => {
                    const currentIndex = currentItem.index
                    const currentStatus = currentItem.status

                    const isDragItem = currentItem.id === item.id

                    if (isDragItem) {
                        let index = dropIndex

                        if (dropStatus === dragStatus && dragIndex < dropIndex) {
                            index--
                        }

                        const update = {
                            ...currentItem,
                            index,
                            status: dropStatus,
                        }

                        // TODO: handle loading status
                        if (dropStatus === LipStatus.DELETED) {
                            // TODO: defer deletion with message selection
                            requestService.deleteLip(update.id, DELETE_MESSAGES.TOO_LATE)
                                .then(console.log)
                        } else {
                            requestService.updateLip(update)
                                .then(console.log)
                        }

                        return update
                    }

                    let index = currentIndex

                    if (currentStatus === dragStatus && currentIndex > dragIndex) {
                        index--
                    }

                    if (currentStatus === dropStatus && currentIndex >= dropIndex) {
                        index++
                    }

                    return {
                        ...currentItem,
                        index,
                    }
                })
            })
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [ item ])

    return (
        <StyledWrapper
            ref={dragRef}
            isDragging={dragCollection.isDragging}
        >
            <ListItem>
                {children}
            </ListItem>

            <StyledDropAboveArea
                ref={dropAboveRef}
                isOver={dropAboveCollection.isOver}
            />

            <StyledDropBelowArea
                ref={dropBelowRef}
                isOver={dropBelowCollection.isOver}
            />
        </StyledWrapper>
    )
}

export default DragItem