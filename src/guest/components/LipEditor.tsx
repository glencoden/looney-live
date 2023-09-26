import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { useCallback, useState } from 'react'
import { requestService } from '../../services/requestService.ts'
import { storageService } from '../../services/storageService.ts'
import { TLip } from '../../types/TLip.ts'
import { TSong } from '../../types/TSong.ts'

type Props = {
    song: TSong
    onLipEdited: (lip: TLip | null) => void
}

const makeNonBreaking = (text: string): string => {
    return text.replace(/\s/g, '\xa0')
}

// TODO: make this a modal, also add edit functionality

const LipEditor: React.FC<Props> = ({ song, onLipEdited }) => {
    const [ name, setName ] = useState('')

    const onCreate = useCallback(() => {
        // TODO: add error handling
        if (!name) {
            return
        }

        requestService.createGuestLip(storageService.getGuestGuid(), song.id, name)
            .then((response) => {
                onLipEdited(response.data)
            })
    }, [ song, onLipEdited, name ])

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3,
                    width: '300px',
                    height: '100dvh',
                }}
            >
                <Typography variant="h5">
                    Du möchtest {makeNonBreaking(song.title)} von {makeNonBreaking(song.artist)} singen?
                </Typography>

                <Typography>
                    Sag uns wie du heißt und wir holen dich auf die Bühne!
                </Typography>

                <TextField
                    autoFocus={true}
                    fullWidth
                    label="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Button
                        variant="contained"
                        onClick={onCreate}
                    >
                        Los geht's!
                    </Button>

                    <Button
                        onClick={() => onLipEdited(null)}
                    >
                        Doch nicht
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}

export default LipEditor