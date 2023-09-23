import { Divider } from '@mui/material'
import Box from '@mui/material/Box'
import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import { TLip } from '../types/TLip.ts'
import SongLip from '../ui/SongLip.tsx'
import DragItem from './components/DragItem.tsx'
import DragTarget from './components/DragTarget.tsx'
import { LipStatus } from './enums/LipStatus.ts'

const filterItems = (items: TLip[], filter: LipStatus): TLip[] => {
    return items
        .filter((item) => item.status === filter)
        .sort((a, b) => a.index - b.index)
}


const App: React.FC<void> = () => {
    const [ items, setItems ] = useState([
        { id: 1, name: 'glen', status: LipStatus.IDLE, index: 0 },
        { id: 2, name: 'coden', status: LipStatus.IDLE, index: 1 },
        { id: 3, name: 'shingle', status: LipStatus.STAGED, index: 0 },
    ])
    return (
        <DndProvider backend={TouchBackend}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '820px', display: 'flex', justifyContent: 'space-around' }}>
                    <Box sx={{ width: '360px', bgcolor: 'background.paper' }}>
                        <DragTarget status={LipStatus.LIVE}>
                            {filterItems(items, LipStatus.LIVE).map((item) => (
                                <DragItem
                                    key={item.id}
                                    id={item.id}
                                    setItems={setItems}
                                >
                                    <SongLip {...item} />
                                </DragItem>
                            ))}
                        </DragTarget>

                        <Divider />

                        <DragTarget status={LipStatus.STAGED}>
                            {filterItems(items, LipStatus.STAGED).map((item) => (
                                <DragItem
                                    key={item.id}
                                    id={item.id}
                                    setItems={setItems}
                                >
                                    <SongLip {...item} />
                                </DragItem>
                            ))}
                        </DragTarget>
                    </Box>
                    <Box sx={{ width: '360px', bgcolor: 'background.paper' }}>
                        <DragTarget status={LipStatus.IDLE}>
                            {filterItems(items, LipStatus.IDLE).map((item) => (
                                <DragItem
                                    key={item.id}
                                    id={item.id}
                                    setItems={setItems}
                                >
                                    <SongLip {...item} />
                                </DragItem>
                            ))}
                        </DragTarget>
                    </Box>
                </Box>
            </Box>
        </DndProvider>
    )
}

export default App
