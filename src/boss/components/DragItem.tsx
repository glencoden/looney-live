import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { ListItem } from '@mui/material'
import styled from '@emotion/styled'
import { DragItemType } from '../enums/DragItemType.ts'

const Styled = styled.div`
    opacity: ${(props) => props.isDragging ? 0.5 : 1};
`

type Props = {
    id: number
    setItems: (items: TLip[]) => void
}

const DragItem: React.FC<Props> = ({ id, setItems, children }) => {
    const [ collection, drag ] = useDrag(() => ({
        type: DragItemType.LIP,
        item: { id },
        options: {
            dropEffect: 'move',
        },
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult()

            setItems((prevItems) => {
                return prevItems.map((prevItem) => {
                    if (prevItem.id !== item.id) {
                        return prevItem
                    }
                    return {
                        ...prevItem,
                        status: dropResult.status,
                    }
                })
            })
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))

    const ref = useRef(null)

    drag(ref)

    return (
        <ListItem>
            <Styled
                ref={ref}
                isDragging={collection.isDragging}
            >
                {children}
            </Styled>
        </ListItem>
    )
}

export default DragItem