'use client'
import { useCallback, useState } from 'react'
import { api } from '@/utils/axios.config'

export type CreateClassData = {
    title: string
    batchId: number
    secondBatchId: number | null
    moduleId: number
    description?: string
    startDateTime: string
    endDateTime: string
    timeZone: string
    isZoomMeet: boolean
}

type CreateClassResponse = {
    status: string
    message: string
    data?: any
}

export function useCreateClass() {
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const createClass = useCallback(async (classData: CreateClassData) => {
        setCreating(true)
        setError(null)
        try {
            const res = await api.post<CreateClassResponse>('/classes', classData)
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
