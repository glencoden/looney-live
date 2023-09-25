import { LipStatus } from '../boss/enums/LipStatus.ts'

export type TLip = {
    id: number
    sessionId: number
    songId: number
    guestGuid: string
    date: string
    name: string
    status: LipStatus
    message?: string | null
    index: number // client extension for sorting
}