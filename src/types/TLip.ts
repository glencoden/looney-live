import { LipStatus } from '../boss/enums/LipStatus.ts'

export type TLip = {
    id: number
    sessionId: number
    songId: number
    guestGuid: string
    guestName: string
    status: LipStatus
    index: number
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
    liveAt: Date | null
    doneAt: Date | null
    message?: string
}