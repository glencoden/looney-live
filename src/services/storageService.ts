import { TJson } from '../types/TJson.ts'

const STORAGE_KEYS = {
    SESSION_GUID: 'LOONEY.SESSION_GUID',
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

    getGuestGuid(): string {
        return this._get(STORAGE_KEYS.GUEST_GUID) || ''
    }

    setGuestGuid(guid: string): void {
        this._set(STORAGE_KEYS.GUEST_GUID, guid)
    }

    getSessionGuid(): string {
        return this._get(STORAGE_KEYS.SESSION_GUID) || ''
    }

    setSessionGuid(guid: string): void {
        this._set(STORAGE_KEYS.SESSION_GUID, guid)
    }
}

export const storageService = new StorageService()