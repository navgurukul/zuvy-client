import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/utils/axios.config'

export interface AttendanceRecord {
    id?: number
    userId: number | string
    batchId?: number
    bootcampId?: number
    sessionId?: number | string
    attendanceDate?: string
    name?: string
    email?: string
    status?: string
    duration?: number
    version?: string | null
    createdAt?: string
}

export interface AttendanceStatusData {
    sessionId: number | string
    sessionStatus: string
    isZoomMeet: boolean
    ready: boolean
    state: string
    reason: string | null
    totalStudents: number
    presentCount: number
    absentCount: number
    attendancePercentage: number
    studentAttendanceRecords: AttendanceRecord[]
}

export interface AttendanceStatusResponse {
    success: boolean
    data: AttendanceStatusData
    message: string
}

export interface UseAttendanceStatusOptions {
    enabled?: boolean
}

export function useAttendanceStatus(
    sessionId: string | number | null | undefined,
    options: UseAttendanceStatusOptions = {}
) {
    const { enabled = true } = options

    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusData | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            mountedRef.current = false
        }
    }, [])

    const fetchAttendanceStatus = useCallback(
        async (fetchSessionId?: string | number) => {
            const id = fetchSessionId ?? sessionId
            if (!id) return null

            setLoading(true)
            setError(null)

            try {
                const response = await api.get<AttendanceStatusResponse>(
                    `/classes/attendance/${id}`
                )
                const data = response.data?.data ?? null

                if (mountedRef.current) {
                    setAttendanceStatus(data)
                }

                return data
            } catch (err: any) {
                if (mountedRef.current) {
                    setError(err)
                    console.error('Error fetching attendance status:', err)
                }
                throw err
            } finally {
                if (mountedRef.current) {
                    setLoading(false)
                }
            }
        },
        [sessionId]
    )

    useEffect(() => {
        if (enabled && sessionId) {
            fetchAttendanceStatus()
        }
    }, [sessionId, enabled, fetchAttendanceStatus])

    /**
     * `ready` is true when the API returns ready: true.
     * The `state` field can be "ready" or "completed" depending on processing stage.
     */
    const isAttendanceReady = attendanceStatus?.ready === true

    return {
        attendanceStatus,
        isAttendanceReady,
        loading,
        error,
        fetchAttendanceStatus,
    }
}

export default useAttendanceStatus
