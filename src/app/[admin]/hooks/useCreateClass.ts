'use client'
import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'
import { CreateClassData, CreateClassResponse } from './hookType'

export function useCreateClass() {
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const createClass = useCallback(async (classData: CreateClassData) => {
        setCreating(true)
        setError(null)
        try {
            const res = await api.post<CreateClassResponse>('/classes', classData)

            const responseStatus = String(res.data?.status || '').trim().toLowerCase()
            const isSuccessful = ['success', 'created', 'ok'].includes(responseStatus)

            if (!isSuccessful) {
                const businessError = new Error(
                    res.data?.message 
                )
                ;(businessError as Error & { response?: unknown }).response = res
                throw businessError
            }

            return res.data
        } catch (err) {
            setError(err)
            throw err
        } finally {
            setCreating(false)
        }
    }, [])

    return { createClass, creating, error }
}
