import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { requestService } from '../../../services/requestService.ts'

export const getLipsQueryKey = (sessionId?: number, lipId?: number) => {
    const result = [ 'live', 'lips' ]

    if (typeof sessionId === 'number') {
        result.push(`${sessionId}`)
    }

    if (typeof lipId === 'number') {
        result.push(`${lipId}`)
    }

    return result
}

export const useLipsQuery = (sessionId?: number, lipId?: number) => {
    const queryKey = useMemo(() => {
        return getLipsQueryKey(sessionId, lipId)
    }, [ sessionId, lipId ])

    const queryFn = useCallback(() => {
        return requestService.getLips(sessionId, lipId)
    }, [ sessionId, lipId ])

    return useQuery({
        queryKey,
        queryFn,
    })
}