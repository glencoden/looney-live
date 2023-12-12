import Delete from '@mui/icons-material/Delete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { useCallback, useState } from 'react'
import { MutationRequestType } from '../../enums/MutationRequestType.ts'
import { TSession } from '../../types/TSession.ts'
import { useSessionMutation } from '../requests/mutations/useSessionMutation.ts'
import { useQRCodeQuery } from '../requests/queries/useQRCodeQuery.ts'
import { useSessionsQuery } from '../requests/queries/useSessionsQuery.ts'
import { useSetlistsQuery } from '../requests/queries/useSetlistsQuery.ts'

const SessionPicker = () => {
    // Session edit data

    const [ sessionEditPayload, setSessionEditPayload ] = useState<Partial<TSession> | null>(null)
    const [ setlistId, setSetlistId ] = useState<number | null>(null)
    const [ startDate, setStartDate ] = useState<Date | null>(null)
    const [ endDate, setEndDate ] = useState<Date | null>(null)
    const [ title, setTitle ] = useState('')

    // GET QR code

    const { data: QRCodeResult, isLoading: isQRCodeLoading } = useQRCodeQuery(sessionEditPayload?.id)

    const QRCodeHTML = QRCodeResult?.data ?? null

    // GET setlists

    const { data: setlistsResult, isLoading: isSetlistsLoading } = useSetlistsQuery()

    const setlists = setlistsResult?.data ?? null

    // GET sessions

    const { data: sessionsResult, isLoading: isSessionsLoading } = useSessionsQuery()

    const sessions = sessionsResult?.data ?? null

    // POST | PUT sessions

    const onResetEdit = useCallback(() => {
        setSessionEditPayload(null)
        setSetlistId(null)
        setStartDate(null)
        setEndDate(null)
        setTitle('')
    }, [])

    const {
        mutate,
        isPending: isMutationPending,
    } = useSessionMutation({ onSuccessCallback: onResetEdit })

    const onMutate = useCallback((type: MutationRequestType, deleteSessionId?: number) => {
        switch (type) {
            case MutationRequestType.CREATE: {
                if (
                    setlistId === null ||
                    startDate === null ||
                    endDate === null ||
                    title === ''
                ) {
                    // TODO: Give user validation feedback
                    return
                }

                mutate({
                    type,
                    session: {
                        setlistId,
                        startDate,
                        endDate,
                        title,
                        ...(sessionEditPayload !== null ? sessionEditPayload : {}),
                    },
                })

                break
            }
            case MutationRequestType.UPDATE: {
                if (
                    sessionEditPayload === null ||
                    setlistId === null ||
                    startDate === null ||
                    endDate === null ||
                    title === ''
                ) {
                    // TODO: Give user validation feedback
                    return
                }

                mutate({
                    type,
                    session: {
                        setlistId,
                        startDate,
                        endDate,
                        title,
                        ...sessionEditPayload,
                    } as TSession,
                })

                break
            }
            case MutationRequestType.DELETE: {
                if (typeof deleteSessionId !== 'number') {
                    break
                }

                mutate({
                    type,
                    sessionId: deleteSessionId,
                })

                break
            }
        }
    }, [ sessionEditPayload, setlistId, startDate, endDate, title, mutate ])

    const onEdit = useCallback((session: TSession) => {
        const { setlistId, startDate, endDate, title, ...editPayload } = session

        setSessionEditPayload(editPayload)
        setSetlistId(setlistId)
        setStartDate(startDate)
        setEndDate(endDate)
        setTitle(title)
    }, [])

    // UI

    if (
        isSetlistsLoading ||
        isSessionsLoading ||
        isMutationPending
    ) {
        return (
            <Box sx={{ height: '100dvh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

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
                <Typography variant="h5">
                    {sessionEditPayload !== null ? 'Session bearbeiten' : 'Neue Session erstellen'}
                </Typography>

                {sessionEditPayload !== null && QRCodeHTML !== null && (
                    isQRCodeLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: QRCodeHTML,
                            }}
                        />
                    )
                )}

                <TextField
                    fullWidth
                    label="Titel"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        sx={{ width: '100%' }}
                        label="Start"
                        value={startDate}
                        onChange={(newValue) => setStartDate(newValue)}
                    />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                        sx={{ width: '100%' }}
                        label="Ende"
                        value={endDate}
                        onChange={(newValue) => setEndDate(newValue)}
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
                        {setlists !== null && setlists.map((setlist) => (
                            <MenuItem key={setlist.id} value={setlist.id}>{setlist.title}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    {sessionEditPayload !== null && (
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={onResetEdit}
                        >
                            Zurück
                        </Button>
                    )}

                    <Button
                        variant="contained"
                        onClick={() => onMutate(sessionEditPayload !== null ? MutationRequestType.UPDATE : MutationRequestType.CREATE)}
                    >
                        {sessionEditPayload !== null ? 'Speichern' : 'Erstellen'}
                    </Button>
                </Box>

                {sessions !== null && sessions.length > 0 && (
                    <>
                        <Divider sx={{ width: '100%' }} />

                        <Typography variant="h5">Session auswählen</Typography>

                        {sessions.map((session) => (
                            <Box
                                key={session.id}
                                sx={{ width: '100%', display: 'flex', gap: 1 }}
                            >
                                <Button
                                    variant="outlined"
                                    sx={{ flexGrow: '1' }}
                                    onClick={() => onEdit(session)}
                                >
                                    {session.title}
                                </Button>

                                <IconButton
                                    onClick={() => onMutate(MutationRequestType.DELETE, session.id)}
                                >
                                    <Delete />
                                </IconButton>
                            </Box>
                        ))}
                    </>
                )}
            </Box>
        </Box>
    )
}

export default SessionPicker