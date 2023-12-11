import { LipStatus } from '../boss/enums/LipStatus.ts'
import { TLip } from './TLip.ts'

export type TLipUpdate = {
    id: TLip['id']
    dragIndex: number
    dragStatus: LipStatus
    dropIndex: number
    dropStatus: LipStatus
    message: string
}