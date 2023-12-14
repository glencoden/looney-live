import { ServerError } from './ServerError.ts'

export type ServerResult<T> = {
    data: T | null,
    error: ServerError | null
}