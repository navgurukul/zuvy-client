import { toast } from '@/components/ui/use-toast'
import { api } from './axios.config'
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
        setStoreStudentData(data.totalStudents)
    } catch (error) {
        console.error('Error fetching student data:', error)
    }
}

export async function onBatchChange(
    selectedvalue: any,
    student: any,
    initialValue: any,
    bootcampId: any,
    setStoreStudentData: any,
    fetchStudentData: any
) {
    if (initialValue === selectedvalue) {
        toast({
            title: 'Cannot Update the Batch',
            description: 'Initial Batch And selected batch Are same',
        })
    }

    try {
        let url = `/batch/reassign/student_id=${student.userId}/new_batch_id=${selectedvalue}`

        if (student.batchId && student.batchId !== 'unassigned') {
            url += `?old_batch_id=${student.batchId}`
        } else {
            url += `?bootcamp_id=${bootcampId}`
        }

        const res = await api.patch(url)

        fetchStudentData(bootcampId, setStoreStudentData)
        toast({
            title: res.data.status,
            description: res.data.message,
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message,
        })
    }
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
        return 'text-destructive' // Red color for attendance < 50%
    } else if (attendance >= 50 && attendance < 75) {
        return 'text-yellow-dark' // Yellow color for attendance between 50% and 75%
    } else {
        return 'text-secondary' // Green color for attendance >= 75%
    }
}
