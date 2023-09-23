import { Divider } from '@mui/material'
import Box from '@mui/material/Box'
import React, { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'
import { TLip } from '../types/TLip.ts'
import SongLip, { SONG_LIP_WIDTH } from '../ui/SongLip.tsx'
import DragItem from './components/DragItem.tsx'
import DragTarget from './components/DragTarget.tsx'
import { LipStatus } from './enums/LipStatus.ts'

const filterItems = (items: TLip[], filter: LipStatus): TLip[] => {
    return items
        .filter((item) => item.status === filter)
        .sort((a, b) => a.index - b.index)
}

const START_FIELD_HEIGHT = 100


const App: React.FC = () => {
    const [ items, setItems ] = useState([
        { id: 1, name: 'glen', status: LipStatus.IDLE, index: 0 },
        { id: 2, name: 'coden', status: LipStatus.IDLE, index: 1 },
        { id: 3, name: 'shingle', status: LipStatus.STAGED, index: 0 },
    ] as unknown as TLip[])

    return (
        <DndProvider backend={TouchBackend}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ width: '820px', display: 'flex', justifyContent: 'space-around' }}>

                    {/* LEFT */}

                    <Box sx={{ width: `${SONG_LIP_WIDTH + 32}px`, height: '100dvh', bgcolor: 'background.paper' }}>
                        <Box
                            sx={{
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `${START_FIELD_HEIGHT}px`,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <DragTarget
                                status={LipStatus.LIVE}
                                items={items}
                            >
                                {filterItems(items, LipStatus.LIVE).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                        setItems={setItems}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DragTarget>
                        </Box>

                        <Divider />

                        <Box
                            sx={{
                                width: `${SONG_LIP_WIDTH + 32}px`,
                                height: `calc(100dvh - ${START_FIELD_HEIGHT}px)`,
                                bgcolor: 'background.paper',
                                overflow: 'scroll',
                            }}
                        >
                            <DragTarget
                                status={LipStatus.STAGED}
                                items={items}
                            >
                                {filterItems(items, LipStatus.STAGED).map((item) => (
                                    <DragItem
                                        key={item.id}
                                        item={item}
                                        setItems={setItems}
                                    >
                                        <SongLip {...item} />
                                    </DragItem>
                                ))}
                            </DragTarget>
                        </Box>
                    </Box>

                    {/* RIGHT */}

                    <Box
                        sx={{
                            width: `${SONG_LIP_WIDTH + 32}px`,
                            height: '100dvh',
                            bgcolor: 'background.paper',
                            overflow: 'scroll',
                        }}
                    >
                        <DragTarget
                            status={LipStatus.IDLE}
                            items={items}
                        >
                            {filterItems(items, LipStatus.IDLE).map((item) => (
                                <DragItem
                                    key={item.id}
                                    item={item}
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
