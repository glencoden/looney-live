import { TJson } from '../types/TJson.ts'
import { TSession } from '../types/TSession.ts'

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

    constructor() {
        if (import.meta.env.DEV) {
            this.baseUrl = 'http://localhost:5555'
        } else {
            switch (import.meta.env.VITE_HOST_ENV) {
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

    getSessions(id?: number) {
        return this._get(`${this.baseUrl}/live/sessions${id ? `/${id}` : ''}`)
    }

    getSetlists() {
        return this._get(`${this.baseUrl}/repertoire/setlist`)
    }

    createSession(session: Partial<TSession>) {
        return this._post(`${this.baseUrl}/live/sessions`, session)
    }
}

export const requestService = new RequestService()