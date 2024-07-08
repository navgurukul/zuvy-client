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
            className: 'text-start capitalize border border-destructive',
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
            className: 'text-start capitalize border border-secondary',
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.message,
            className: 'text-start capitalize border border-destructive',
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
                className: 'text-start capitalize border border-secondary',
            })
            fetchStudentData(bootcampId, setStudentData)
        })
    } catch (error: any) {
        toast({
            title: 'Failed',
            description: error.response?.data?.message || 'An error occurred.',
            className: 'text-start capitalize border border-destructive',
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

// Student Assessment functions:-
export function requestFullScreen(element: HTMLElement) {
    if (element.requestFullscreen) {
        element.requestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
        /* Firefox */
        ;(element as any).mozRequestFullScreen()
    } else if ((element as any).webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        ;(element as any).webkitRequestFullscreen()
    } else if ((element as any).msRequestFullscreen) {
        /* IE/Edge */
        ;(element as any).msRequestFullscreen()
    }
}

// tab change event listener
export function handleVisibilityChange() {
    if (document.hidden) {
        console.log('The Page is no longer visible. Test ended.')
    }
}

// Request full screen as full screen is only allowed by user click

export function handleFullScreenChange() {
    if (!document.fullscreenElement) {
        alert('User has exited full screen. Test ended.')
        // Here you could end the test, show a warning, etc.
    }
}

// --------------------------------------------
