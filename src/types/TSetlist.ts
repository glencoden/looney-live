import { TSong } from './TSong.ts'

export type TSetlist = {
    id: number
    toolKey?: string
    title: string
    songs: TSong['id'][]
    songsByToolKeyId: string[]
    published: boolean
}