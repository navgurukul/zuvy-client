'use client'

import axios, { AxiosRequestConfig } from 'axios'

const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL
// const mainUrl = "http://zuvy.navgurukul.org/"
const apiURL = process.env.NEXT_PUBLIC_API_URL
const localUrl = process.env.NEXT_PUBLIC_LOCAL_URL

const access_token = localStorage.getItem('access_token')
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
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    // const access_token = localStorage.getItem('access_token')
    // if (access_token) {
    //     config.headers.Authorization = `Bearer ${access_token}`
    // }
    return config
})

export { api, apiMeraki }
