import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { requestService } from '../../../services/requestService.ts'

export const getSetlistsQueryKey = () => {
    return [ 'repertoire', 'setlists' ]
}

export const useSetlistsQuery = () => {
    const queryKey = useMemo(() => {
        return getSetlistsQueryKey()
    }, [])

    const queryFn = useCallback(() => {
        return requestService.getSetlists()
    }, [])

    return useQuery({
        queryKey,
        queryFn,
    })
}