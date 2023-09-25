import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Lips from './components/Lips.tsx'
import Songs from './components/Songs.tsx'

const App: React.FC = () => {
    const [ activeTab, setActiveTab ] = useState(0)

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box
                sx={{
                    width: 'min(420px, 100vw)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(_event, newValue) => setActiveTab(newValue)}
                    >
                        <Tab label="Songs" />
                        <Tab label="Lips" />
                    </Tabs>
                </Box>

                {activeTab === 0 && <Songs />}

                {activeTab === 1 && <Lips />}
            </Box>
        </Box>
    )
}

export default App
