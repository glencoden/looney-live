import React, { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { requestService } from '../../services/requestService.ts'
import { TJson } from '../../types/TJson.ts'
import { TSession } from '../../types/TSession.ts'

type Props = {
    onSelect: React.Dispatch<React.SetStateAction<TSession | null>>
}

const SessionPicker: React.FC<Props> = ({ onSelect }) => {
    const [ sessions, setSessions ] = useState<TSession[] | null>(null)
    const [ setlistOptions, setSetlistOptions ] = useState<{ id: number, title: string }[] | null>(null)

    const [ setlistId, setSetlistId ] = useState<number | null>(null)
    const [ date, setDate ] = useState<Date | null>(null)
    const [ title, setTitle ] = useState('')

    useEffect(() => {
        requestService.getSessions()
            .then((response) => {
                setSessions(response.data)
            })
    }, [ setSessions ])

    useEffect(() => {
        requestService.getSetlists()
            .then((response) => {
                setSetlistOptions(response.data.map((setlist: TJson) => ({ id: setlist.id, title: setlist.title })))
            })
    }, [ setSetlistOptions ])

    const onCreate = useCallback(() => {
        if (setlistId === null || date === null || title === '') {
            return
        }
        requestService.createSession({
            setlistId,
            date: date?.toISOString(),
            title,
        })
            .then((response) => {
                onSelect(response.data)
            })
    }, [ setlistId, date, title, onSelect ])

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
            <Box
                sx={{
                    width: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    padding: 5,
                    overflow: 'hidden',
                }}
            >
                <Typography variant="h5">Neue Session erstellen</Typography>

                <TextField
                    fullWidth
                    label="Titel"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        sx={{ width: '100%' }}
                        label="Datum"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                    />
                </LocalizationProvider>

                <FormControl fullWidth>
                    <InputLabel id="setlist-select-label">
                        Setlist
                    </InputLabel>
                    <Select
                        labelId="setlist-select-label"
                        value={setlistId ?? ''}
                        label="Setlist"
                        onChange={(event) => setSetlistId(event.target.value as number)}
                    >
                        {setlistOptions !== null && setlistOptions.map((setlist) => (
                            <MenuItem key={setlist.id} value={setlist.id}>{setlist.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={onCreate}
                >
                    Erstellen
                </Button>

                {sessions !== null && sessions.length > 0 && (
                    <>
                        <Divider sx={{ width: '100%' }} />

                        <Typography variant="h5">Session auswählen</Typography>

                        {sessions.map((session) => (
                            <Button
                                key={session.id}
                                variant="outlined"
                                sx={{ width: '100%' }}
                                onClick={() => onSelect(session)}
                            >
                                {session.title}
                            </Button>
                        ))}
                    </>
                )}
            </Box>
        </Box>
    )
}

export default SessionPicker