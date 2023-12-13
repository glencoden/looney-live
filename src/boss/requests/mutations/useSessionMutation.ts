import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { MutationRequestType } from '../../../enums/MutationRequestType.ts'
import { requestService } from '../../../services/requestService.ts'
import { TSession } from '../../../types/TSession.ts'
import { getSessionsQueryKey } from '../queries/useSessionsQuery.ts'

type Params = {
    onSuccessCallback?: () => void
}

type MutationPayload = CreateMutationPayload | UpdateMutationPayload | DeleteMutationPayload

type CreateMutationPayload = {
    type: MutationRequestType.CREATE
    session: Partial<TSession>
}

type UpdateMutationPayload = {
    type: MutationRequestType.UPDATE
    session: TSession
}

type DeleteMutationPayload = {
    type: MutationRequestType.DELETE
    sessionId: TSession['id']
}


export const useSessionMutation = ({ onSuccessCallback }: Params) => {
    const queryClient = useQueryClient()

    const mutationFn = useCallback((payload: MutationPayload) => {
        switch (payload.type) {
            case MutationRequestType.CREATE:
                return requestService.createSession(payload.session)
            case MutationRequestType.UPDATE:
                return requestService.writeSession(payload.session)
            case MutationRequestType.DELETE:
                return requestService.deleteSession(payload.sessionId)
        }
    }, [])

    const sessionsQueryKey = useMemo(() => {
        return getSessionsQueryKey()
    }, [])

    const onSuccess = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: sessionsQueryKey })

        if (typeof onSuccessCallback === 'function') {
            onSuccessCallback()
        }
    }, [ onSuccessCallback, queryClient, sessionsQueryKey ])

    return useMutation({
        mutationFn,
        onSuccess,
        onError: console.error,
    })
}