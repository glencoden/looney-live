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

    const mutationFn = useCallback((payload: MutationPayload) => {
        const { lipUpdate, optimisticResult } = payload
        // TODO: set optimistic result
        return requestService.updateLip(lipUpdate)
    }, [])

    const lipsQueryKey = useMemo(() => {
        return getLipsQueryKey()
    }, [])

    const onSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: lipsQueryKey })
    }, [ queryClient, lipsQueryKey ])

    const onError = useCallback((err, variables, context) => {
        // TODO: implement rollback here
        console.log(err, variables, context)
    }, [])

    return useMutation({
        mutationFn,
        onSuccess,
        onError,
    })
}