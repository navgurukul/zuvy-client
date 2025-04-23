'use client'

import axios, { AxiosRequestConfig } from 'axios'

let mainUrl = process.env.NEXT_PUBLIC_MAIN_URL
// const mainUrl = "http://zuvy.navgurukul.org/"
const apiURL = process.env.NEXT_PUBLIC_API_URL
const localUrl = process.env.NEXT_PUBLIC_LOCAL_URL
const env_name = process.env.NODE_ENV

let headers: AxiosRequestConfig['headers'] = {
    'Content-Type': 'application/json',
}

if (process.env.NEXT_PUBLIC_ENV_NAME === 'STAGE') {
    mainUrl = 'https://stage.api.zuvy.org'
}

const api = axios.create({
    baseURL: mainUrl,
    headers,
})

if (typeof window !== 'undefined') {
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })
}

const apiMeraki = axios.create({
    baseURL: apiURL,
    headers,
})

apiMeraki.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export { api, apiMeraki }
