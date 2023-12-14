import { TLip } from './TLip.ts'
import { TSong } from './TSong.ts'

export type TGuestData = {
    sessionId: number
    guid: string
    songs: TSong[]
    lips: TLip[]
}