import { toast } from '@/components/ui/use-toast'
import api from './axios.config'
import { OFFSET, POSITION } from './constant'

export const fetchStudentData = async (
    id: number,
    setStoreStudentData: any
) => {
    try {
        const response = await api.get(
            `/bootcamp/students/${id}/?limit=${POSITION}&offset=${OFFSET}`
        )
        const data = response.data
        setStoreStudentData(data.studentsEmails)
    } catch (error) {
        // Handle error appropriately
        console.error('Error fetching student data:', error)
    }
}

export async function onBatchChange(selectedvalue: any, student: any) {
    await api
        .post(
            `/bootcamp/students/${student.bootcampId}?batch_id=${selectedvalue}`,
            {
                students: [
                    {
                        email: student.email,
                        name: student.name,
                    },
                ],
            }
        )
        .then((res) => {
            toast({
                title: 'Students Batch Updated Succesfully',
                className: 'text-start capitalize',
            })
        })
}

export async function deleteStudentHandler(
    userId: any,
    bootcampId: any,
    setDeleteModalOpen: any,
    setStudentData: any
) {
    try {
        await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            toast({
                title: res.data.status,
                description: res.data.message,
                className: 'text-start capitalize',
            })
            fetchStudentData(bootcampId, setStudentData)
        })
    } catch (error) {
        toast({
            title: 'Failed',
            variant: 'destructive',
        })
    }
    setDeleteModalOpen(false)
}

export const getAttendanceColorClass = (attendance: number) => {
    if (attendance < 50) {
        return 'text-red-400' // Red color for attendance < 50%
    } else if (attendance >= 50 && attendance < 75) {
        return 'text-yellow-400' // Yellow color for attendance between 50% and 75%
    } else {
        return 'text-green-400' // Green color for attendance >= 75%
    }
}
