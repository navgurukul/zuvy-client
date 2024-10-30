import { useState, useEffect, useCallback } from 'react'
import { api } from '@/utils/axios.config'

const useAttendanceData = (bootcampId: string) => {
    const [attendanceData, setAttendanceData] = useState<string[]>([])
    const [error, setError] = useState<string | null>(null)

    const fetchAttendanceData = useCallback(async () => {
        try {
            const response = await api.get(
                `/classes/meetings/{bootcampId}?bootcampId=${bootcampId}`
            )
            setAttendanceData(response.data.unattendedClassIds)
        } catch (err: any) {
            setError('Error Fetching the Attendance Class Ids')
            console.error(err)
        }
    }, [bootcampId])

    useEffect(() => {
        fetchAttendanceData()
    }, [fetchAttendanceData])

    return { attendanceData, error }
}

export default useAttendanceData
