import { TJson } from '../types/TJson.ts'
import { TLip } from '../types/TLip.ts'

const STORAGE_KEYS = {
    SESSION_INDEXES: 'BERTA.SESSION_INDEXES',
}

class StorageService {
    _get(key: string) {
        return this._parse(localStorage.getItem(key))
    }

    _set(key: string, value: string | number | TJson) {
        return localStorage.setItem(key, this._stringify(value))
    }

    _stringify(value: string | number | TJson) {
        return JSON.stringify(value)
    }

    _parse(value: string | null) {
        if (value === null) {
            return null
        }
        let result = null
        try {
            result = JSON.parse(value)
        } catch (err) {
            console.error(err)
        }
        return result
    }

    getSessionIndexes(sessionId: number): { [key: string]: number } {
        const sessionIndexes = this._get(STORAGE_KEYS.SESSION_INDEXES) || {}

        return sessionIndexes[sessionId] || {}
    }

    setSessionIndexes(sessionId: number, items: TLip[]): void {
        const currentIndexes = items.reduce((result: { [key: string]: number }, item) => ({
            ...result,
            [item.id]: item.index,
        }), {})

        const sessionIndexes = this._get(STORAGE_KEYS.SESSION_INDEXES) || {}

        sessionIndexes[sessionId] = currentIndexes

        this._set(STORAGE_KEYS.SESSION_INDEXES, sessionIndexes)
    }
}

export const storageService = new StorageService()