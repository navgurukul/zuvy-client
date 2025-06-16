'use client'

import axios, { AxiosRequestConfig } from 'axios'

const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL
// const mainUrl = "http://zuvy.navgurukul.org/"
const apiURL = process.env.NEXT_PUBLIC_API_URL
const localUrl = process.env.NEXT_PUBLIC_LOCAL_URL

// const access_token = localStorage.getItem('access_token')
let headers: AxiosRequestConfig['headers'] = {
    'Content-Type': 'application/json',
}
// let merakiHeaders: AxiosRequestConfig['headers'] = {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${access_token}`,
// }

const api = axios.create({
    baseURL: mainUrl,
    headers,
})

if (typeof window !== 'undefined') {
    api.interceptors.request.use((config) => {
        // const token = localStorage.getItem('token')
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`
        // }
        const access_token = localStorage.getItem('access_token')
        if (access_token) {
            config.headers.Authorization = `Bearer ${access_token}`
        }
        return config
    })
}

const apiMeraki = axios.create({
    baseURL: apiURL,
    headers,
})

apiMeraki.interceptors.request.use((config) => {
    // const token = localStorage.getItem('token')
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`
    // }
    const access_token = localStorage.getItem('access_token')
    if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`
    }
    return config
})

type FailedRequest = {
    resolve: (access_token: string) => void
    reject: (error: any) => void
}

let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: unknown, access_token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            access_token && prom.resolve(access_token)
        }
    })

    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('One')
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('Two')
            if (isRefreshing) {
                console.log('Three')
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((access_token) => {
                        originalRequest.headers.Authorization = `Bearer ${access_token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                console.log('Four')
                const refresh_token = localStorage.getItem('refresh_token')
                const response = await axios.post('/auth/refresh', {
                    refresh_token,
                })

                const newAccessToken = response.data.access_token
                localStorage.setItem('access_token', newAccessToken)

                api.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${newAccessToken}`
                processQueue(null, newAccessToken)
                return api(originalRequest)
            } catch (err) {
                console.log('Five')
                processQueue(err, null)
                // Optionally: logout user
                // localStorage.clear()
                // window.location.href = '/'
                return Promise.reject(err)
            } finally {
                console.log('Six')
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export { api, apiMeraki }
