function encodeURI(data) {
    const formBody = []
    for (const key in data) {
        const encodedKey = encodeURIComponent(key)
        const encodedValue = encodeURIComponent(data[key])
        formBody.push(`${encodedKey}=${encodedValue}`)
    }
    return formBody.join('&')
}


class RequestService {
    baseUrl = ''
    oAuth2_access_token = ''
    tokenExpiryDate = null

    constructor() {
        switch (process.env.REACT_APP_HOST_ENV) {
            case 'develop':
                this.baseUrl = 'http://tsc.lan'
                break
            case 'staging':
                this.baseUrl = ''
                break
            case 'prod':
                this.baseUrl = ''
                break
            default:
                this.baseUrl = 'http://localhost:5555'
        }
    }

    get(url) {
        const headers = { 'Content-Type': 'application/json; charset=utf-8' }
        if (this.oAuth2_access_token) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }
        return Promise.resolve()
            .then(() => fetch(url, { method: 'GET', headers }))
            .then(resp => resp.json())
            .catch(err => console.error('Request Service: ', err))
    }

    post(url, data) {
        const headers = { 'Content-Type': 'application/json; charset=utf-8' }
        if (this.oAuth2_access_token) {
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
            .catch(err => console.error('Request Service: ', err))
    }

    put(url, data) {
        const headers = { 'Content-Type': 'application/json; charset=utf-8' }
        if (this.oAuth2_access_token) {
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
            .catch(err => console.error('Request Service: ', err))
    }

    delete(url) {
        const headers = { 'Content-Type': 'application/json; charset=utf-8' }
        if (this.oAuth2_access_token) {
            headers.Authorization = `Bearer ${this.oAuth2_access_token}`
        }
        return Promise.resolve()
            .then(() => fetch(url, { method: 'DELETE', headers }))
            .then(resp => resp.json())
            .catch(err => console.error('Request Service: ', err))
    }

    _postEncodeURI(url, data) {
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

    login(username, password) {
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

                // clear database cache of deleted events and competitors older than stale time (server variable)
                this.get(`${this.baseUrl}/api/clear_database`)
                    .then(resp => {
                        if (!resp?.success) {
                            console.warn('error trying to clear database cache')
                        }
                    })

                return {
                    success: true,
                }
            })
    }

    isAuthTokenValid() {
        return new Date() < this.tokenExpiryDate
    }
}

export const requestService = new RequestService()