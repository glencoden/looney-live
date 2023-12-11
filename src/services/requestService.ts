import { ServerResult } from '../types/ServerResult.ts'
import { TGuestData } from '../types/TGuestData.ts'
import { TJson } from '../types/TJson.ts'
import { TLip } from '../types/TLip.ts'
import { TLipUpdate } from '../types/TLipUpdate.ts'
import { TSession } from '../types/TSession.ts'
import { io, Socket } from 'socket.io-client'
import { TSetlist } from '../types/TSetlist.ts'

function encodeURI(data: TJson) {
    const formBody = []
    for (const key in data) {
        const encodedKey = encodeURIComponent(key)
        const encodedValue = encodeURIComponent(data[key])
        formBody.push(`${encodedKey}=${encodedValue}`)
    }
    return formBody.join('&')
}

const TOKEN_EXPIRY_SAFETY_MARGIN = 60 // seconds

class RequestService {
    baseUrl = ''
    oAuth2_access_token: string | null = null
    tokenExpiryDate: Date | null = null
    socket: Socket | null = null

    constructor() {
        if (import.meta.env.MODE === 'development') {
            this.baseUrl = 'http://localhost:5555'
        } else {
            switch (import.meta.env.VITE_HOST_ENV) {
                case 'local':
                    this.baseUrl = 'http://localhost:5555'
                    break
                case 'develop':
                    this.baseUrl = 'http://looneyapi.lan'
                    break
                case 'staging':
                    this.baseUrl = 'https://staging.api.looneytunez.de'
                    break
                case 'prod':
                    this.baseUrl = 'https://api.looneytunez.de'
                    break
            }
        }
        this.socket = io(this.baseUrl, { rejectUnauthorized: false })
    }

    getSocket() {
        if (this.socket === null) {
            this.socket = io(this.baseUrl, { rejectUnauthorized: false })

        }
        return this.socket
    }

    isLoggedIn() {
        return this.oAuth2_access_token !== null && new Date() < this.tokenExpiryDate!
    }

    _get(url: string) {
        const headers: HeadersInit = { 'Content-Type': 'application/json; charset=utf-8' }

        if (this.oAuth2_access_token !== null) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }

        return Promise.resolve()
            .then(() => fetch(url, { method: 'GET', headers }))
            .then(resp => resp.json())
    }

    _post(url: string, data: TJson) {
        const headers: HeadersInit = { 'Content-Type': 'application/json; charset=utf-8' }

        if (this.oAuth2_access_token !== null) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }

        return Promise.resolve()
            .then(() => JSON.stringify(data))
            .then(body => fetch(url, {
                method: 'POST',
                headers,
                body,
            }))
            .then(resp => resp.json())
    }

    _put(url: string, data: TJson) {
        const headers: HeadersInit = { 'Content-Type': 'application/json; charset=utf-8' }

        if (this.oAuth2_access_token !== null) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }

        return Promise.resolve()
            .then(() => JSON.stringify(data))
            .then(body => fetch(url, {
                method: 'PUT',
                headers,
                body,
            }))
            .then(resp => resp.json())
    }

    _delete(url: string) {
        const headers: HeadersInit = { 'Content-Type': 'application/json; charset=utf-8' }

        if (this.oAuth2_access_token !== null) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }

        return Promise.resolve()
            .then(() => fetch(url, { method: 'DELETE', headers }))
            .then(resp => resp.json())
    }

    _postEncodeURI(url: string, data: TJson) {
        return Promise.resolve()
            .then(() => encodeURI(data))
            .then(body => fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body,
            }))
            .then(resp => {
                if (resp.ok) {
                    return resp.json()
                }
                return Promise.reject(resp)
            })
    }

    // boss

    login(username: string, password: string) {
        return this._postEncodeURI(`${this.baseUrl}/auth/login`, {
            username,
            password,
            grant_type: 'password',
            client_id: null,
            client_secret: null,
        })
            .then(resp => {
                // set token and expiry time
                this.oAuth2_access_token = resp.access_token

                const expiryDate = new Date()

                expiryDate.setSeconds(expiryDate.getSeconds() + resp.expires_in - TOKEN_EXPIRY_SAFETY_MARGIN)

                this.tokenExpiryDate = expiryDate

                return true
            })
    }

    logout() {
        this.oAuth2_access_token = null

        return true
    }

    getSetlists(): Promise<ServerResult<TSetlist[]>> {
        return this._get(`${this.baseUrl}/repertoire/setlist`)
    }

    getSessions(id?: number): Promise<ServerResult<TSession[]>> {
        return this._get(`${this.baseUrl}/live/sessions${id ? `/${id}` : ''}`)
    }

    createSession(session: Partial<TSession>) {
        return this._post(`${this.baseUrl}/live/sessions`, session)
    }

    writeSession(session: TSession) {
        return this._put(`${this.baseUrl}/live/sessions`, session)
    }

    deleteSession(sessionId: TSession['id']) {
        return this._delete(`${this.baseUrl}/live/sessions/${sessionId}`)
    }

    getLips(sessionId?: number, lipId?: number): Promise<ServerResult<TLip[]>> {
        return this._get(`${this.baseUrl}/live/lips${sessionId ? `/${sessionId}` : ''}${lipId ? `/${lipId}` : ''}`)
    }

    updateLip(data: TLipUpdate) {
        return this._put(`${this.baseUrl}/live/lips`, data)
    }

    // guest

    getGuestData(guestGuid: string): Promise<{ success: boolean, message?: string, data?: TGuestData }> {
        return this._get(`${this.baseUrl}/live/guest${guestGuid ? `/${guestGuid}` : ''}`)
    }

    createGuestLip(guid: string, songId: number, name: string) {
        return this._post(`${this.baseUrl}/live/guest/${guid}`, { songId, name })
    }

    // shared

    getSong(id: number) {
        return this._get(`${this.baseUrl}/repertoire/songs/${id}`)
    }
}

export const requestService = new RequestService()