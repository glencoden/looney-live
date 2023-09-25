import { TLip } from './TLip.ts'
import { TSong } from './TSong.ts'

export type TGuestData = {
    guid: string
    sessionId: number
    songs: TSong[]
    lips: TLip[]
}