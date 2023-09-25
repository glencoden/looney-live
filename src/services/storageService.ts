import { TJson } from '../types/TJson.ts'
import { TLip } from '../types/TLip.ts'

const STORAGE_KEYS = {
    SESSION_INDEXES: 'LOONEY.SESSION_INDEXES',
    GUEST_GUID: 'LOONEY.GUEST_GUID',
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

    getGuestGuid(): string {
        return this._get(STORAGE_KEYS.GUEST_GUID) || ''
    }

    setGuestGuid(guid: string): void {
        this._set(STORAGE_KEYS.GUEST_GUID, guid)
    }
}

export const storageService = new StorageService()