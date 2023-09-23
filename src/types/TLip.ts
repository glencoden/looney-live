export type TLip = {
    id: number
    sessionId: number
    songId: number
    guestGuid: string
    date: string
    name: string
    status: LipStatus
    message?: string
    index?: number // for sorting in client lists
}