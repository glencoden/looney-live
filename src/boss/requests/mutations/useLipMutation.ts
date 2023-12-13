import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { requestService } from '../../../services/requestService.ts'
import { TLip } from '../../../types/TLip.ts'
import { TLipUpdate } from '../../../types/TLipUpdate.ts'
import { getLipsQueryKey } from '../queries/useLipsQuery.ts'

type MutationPayload = {
    lipUpdate: TLipUpdate,
    optimisticResult: TLip[]
}

export const useLipMutation = () => {
    const queryClient = useQueryClient()

    const lipsQueryKey = useMemo(() => {
        return getLipsQueryKey()
    }, [])

    const mutationFn = useCallback((payload: MutationPayload) => {
        queryClient.setQueryData(lipsQueryKey, payload.optimisticResult)

        return requestService.updateLip(payload.lipUpdate)
    }, [ queryClient, lipsQueryKey ])

    const onSettled = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: lipsQueryKey })
    }, [ queryClient, lipsQueryKey ])

    return useMutation({
        mutationFn,
        onSettled,
    })
}