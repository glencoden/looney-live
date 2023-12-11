import { useQuery } from '@tanstack/react-query'
import parseISO from 'date-fns/parseISO'
import { useCallback, useMemo } from 'react'
import { requestService } from '../../../services/requestService.ts'
import { ServerResult } from '../../../types/ServerResult.ts'
import { TSession } from '../../../types/TSession.ts'

export const getSessionsQueryKey = (sessionId?: number) => {
    const result = [ 'live', 'sessions' ]

    if (typeof sessionId === 'number') {
        result.push(`${sessionId}`)
    }

    return result
}

const onSessionsSelect = (result: ServerResult<TSession[]>): ServerResult<TSession[]> => {
    if (result.data === null) {
        return result
    }

    return {
        ...result,
        data: result.data.map((session) => {
            return {
                ...session,
                startDate: parseISO(session.startDate as unknown as string),
                endDate: parseISO(session.endDate as unknown as string),
            }
        }),
    }
}

export const useSessionsQuery = (sessionId?: number) => {
    const queryKey = useMemo(() => {
        return getSessionsQueryKey(sessionId)
    }, [ sessionId ])

    const queryFn = useCallback(() => {
        return requestService.getSessions(sessionId)
    }, [ sessionId ])

    return useQuery({
        queryKey,
        queryFn,
        select: onSessionsSelect,
    })
}