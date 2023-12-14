import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { requestService } from '../../../services/requestService.ts'

export const getQRCodeQueryKey = (sessionId?: number) => {
    const result = [ 'live', 'qr_code' ]

    if (typeof sessionId === 'number') {
        result.push(`${sessionId}`)
    }

    return result
}

export const useQRCodeQuery = (sessionId?: number) => {
    const queryKey = useMemo(() => {
        return getQRCodeQueryKey(sessionId)
    }, [ sessionId ])

    const queryFn = useCallback(() => {
        return requestService.getQRCode(sessionId)
    }, [ sessionId ])

    return useQuery({
        queryKey,
        queryFn,
    })
}