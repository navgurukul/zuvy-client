import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
import React, { useState } from 'react'

type Props = {
    attendanceData: string[]
}

const AttandanceRefreshComp = ({ attendanceData }: Props) => {
    const [loading, setLoading] = useState<boolean>(false)

    const attandanceRefreshHandler = async () => {
        const requestBody = {
            meetingIds: attendanceData,
        }

        try {
            setLoading(true)
            await api
                .post(`/classes/analytics/reload`, requestBody)
                .then((res) => {
                    toast({
                        title: 'Success',
                        description: res.data.message,
                    })
                })
        } catch (error: any) {
            setLoading(false)
            console.error(
                error.response.data.message || 'Error Refreshing the Data'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? (
                <Button disabled>
                    <Spinner className="  text-black h-5 animate-spin" />
                    Refreshing Attendance
                </Button>
            ) : (
                <Button onClick={attandanceRefreshHandler}>
                    Attendance Refresh
                </Button>
            )}
        </>
    )
}

export default AttandanceRefreshComp
