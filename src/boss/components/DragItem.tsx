import styled from '@emotion/styled'
import CircularProgress from '@mui/material/CircularProgress'
import ListItem from '@mui/material/ListItem'
import React from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { TLip } from '../../types/TLip.ts'
import { DragItemType } from '../enums/DragItemType.ts'
import { LipStatus } from '../enums/LipStatus.ts'
import { useLipMutation } from '../requests/mutations/useLipMutation.ts'
import { useLipsQuery } from '../requests/queries/useLipsQuery.ts'

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

const DragItem: React.FC<Props> = ({ item, children }) => {
    const { data: lipsResult, isLoading: isLipsLoading } = useLipsQuery()

    const currentItems = lipsResult?.data ?? null

    const { mutate, isPending } = useLipMutation()

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
                currentItems === null ||
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

            if (
                (dropStatus === LipStatus.LIVE && currentItems.find((currentItem) => currentItem.status === LipStatus.LIVE)) ||
                (dropStatus === LipStatus.DONE && dragStatus !== LipStatus.LIVE)
            ) {
                return
            }

            const optimisticResult = currentItems.map((currentItem) => {
                const currentIndex = currentItem.index
                const currentStatus = currentItem.status

                const isDragItem = currentItem.id === item.id

                if (isDragItem) {
                    let index = dropIndex

                    if (dropStatus === dragStatus && dragIndex < dropIndex) {
                        index--
                    }

                    return {
                        ...currentItem,
                        index,
                        status: dropStatus,
                    }
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

            let message = ''

            if (dropStatus === LipStatus.DELETED) {
                message = DELETE_MESSAGES.TOO_LATE // TODO: defer deletion with message selection
            }

            mutate({
                lipUpdate: {
                    id: item.id,
                    dragIndex,
                    dragStatus,
                    dropIndex,
                    dropStatus,
                    message,
                },
                optimisticResult,
            })
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [ item, currentItems, mutate ])

    const showLoading = isLipsLoading || isPending

    return (
        <StyledWrapper
            ref={dragRef}
            isDragging={dragCollection.isDragging}
        >
            <ListItem>
                {showLoading ? <CircularProgress /> : children}
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