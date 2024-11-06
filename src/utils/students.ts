import { toast } from '@/components/ui/use-toast'
import { api } from './axios.config'
import { OFFSET, POSITION } from './constant'
import { fetchStudentsHandler } from './admin'
import { getStoreStudentDataNew } from '@/store/store'

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

// export async function onBatchChange(
//     selectedvalue: any,
//     student: any,
//     initialValue: any,
//     bootcampId: any,
//     setStoreStudentData: any,
//     fetchStudentData: any
// ) {
//     if (initialValue === selectedvalue) {
//         toast({
//             title: 'Cannot Update the Batch',
//             description: 'Initial Batch And selected batch Are same',
//             className: 'text-start capitalize border border-destructive',
//         })
//     }

//     try {
//         let url = `/batch/reassign/student_id=${student.userId}/new_batch_id=${selectedvalue}`

//         if (student.batchId && student.batchId !== 'unassigned') {
//             url += `?old_batch_id=${student.batchId}`
//         } else {
//             url += `?bootcamp_id=${bootcampId}`
//         }

//         const res = await api.patch(url)

//         fetchStudentData(bootcampId, setStoreStudentData)
//         toast({
//             title: res.data.status,
//             description: res.data.message,
//             className: 'text-start capitalize border border-secondary',
//         })
//     } catch (error: any) {
//         toast({
//             title: 'Error',
//             description: error.message,
//             className: 'text-start capitalize border border-destructive',
//         })
//     }
// }

export async function deleteStudentHandler(userId: any, bootcampId: any) {
    const {
        students,
        setStudents,
        setTotalPages,
        setLoading,
        offset,
        setTotalStudents,
        setCurrentPage,
        limit,
        search,
    } = getStoreStudentDataNew()
    try {
        await api.delete(`/student/${userId}/${bootcampId}`).then((res) => {
            toast({
                title: res.data.status,
                description: res.data.message,
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
            fetchStudentsHandler({
                courseId: bootcampId,
                limit,
                offset,
                searchTerm: search,
                setLoading,
                setStudents,
                setTotalPages,
                setTotalStudents,
                setCurrentPage,
            })
        })
    } catch (error: any) {
        toast({
            title: 'Failed',
            description: error.response?.data?.message || 'An error occurred.',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
        })
    }
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
export function handleVisibilityChange(
    setTabChangeInstance: any,
    tabChangeInstance: any,
    submitAssessment: () => void,
    isCurrentPageSubmitAssessment: () => Boolean
) {
    if (document.hidden) {
        const newTabChangeInstance = tabChangeInstance + 1
        localStorage.setItem(
            'tabChangeInstance',
            newTabChangeInstance.toString()
        )
        setTabChangeInstance(newTabChangeInstance)
        if (newTabChangeInstance > 2) {
            // Check if the current page is the submitAssessment page
            if (isCurrentPageSubmitAssessment()) {
                // Submit the assessment
                // submitAssessment()
                return toast({
                    title: 'Test Ended -> Tab will close now',
                    description: 'You have changed the tab multiple times.',
                    className:
                        'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-destructive text-white',
                })
            }
        } else {
            return toast({
                title: 'WARNING',
                description:
                    'You have changed the tab. If you change the tab again, your test may get submitted automatically.',
                className:
                    'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-destructive text-white',
            })
        }
    }
}

// Request full screen as full screen is only allowed by user click

export function handleFullScreenChange(
    setFullScreenExitInstance: any,
    fullScreenExitInstance: any,
    submitAssessment: () => void,
    isCurrentPageSubmitAssessment: () => Boolean,
    setIsFullScreen: any
) {
    if (!document.fullscreenElement) {
        setIsFullScreen(false)
        const newFullScreenExitInstance = fullScreenExitInstance + 1
        localStorage.setItem(
            'fullScreenExitInstance',
            newFullScreenExitInstance.toString()
        )
        setFullScreenExitInstance(newFullScreenExitInstance)

        if (newFullScreenExitInstance > 2) {
            // Check if the current page is the submitAssessment page
            if (isCurrentPageSubmitAssessment()) {
                // Submit the assessment
                // submitAssessment()
                return toast({
                    title: 'Test Ended',
                    description: 'You have exited full screen multiple times.',
                    className:
                        'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-destructive text-white',
                })
            }
        } else {
            return toast({
                title: 'WARNING',
                description:
                    'You have exited full screen. If you exit full screen again, your test may get submitted automatically.',
                className:
                    'fixed inset-0 w-1/4 h-1/5 m-auto text-start capitalize border border-destructive bg-destructive text-white',
            })
        }
    }
}

// Disable right click & Function keys & console access:

// Disable right-click context menu
export const handleRightClick = (event: MouseEvent) => {
    event.preventDefault()
}

// Disable key combinations for opening DevTools, function keys, and prevent exiting fullscreen
export const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent common DevTools shortcuts
    if (
        (event.ctrlKey && event.shiftKey && event.code === 'KeyI') || // Ctrl+Shift+I
        (event.ctrlKey && event.shiftKey && event.code === 'KeyJ') || // Ctrl+Shift+J
        (event.ctrlKey && event.code === 'KeyU') || // Ctrl+U (view source)
        (event.ctrlKey && event.code === 'KeyS') || // Ctrl+S (save page)
        event.code === 'F12' || // F12 (DevTools)
        event.code === 'F11' || // F11 (Full Screen toggle)
        event.code === 'Escape' // Escape (exit fullscreen)
    ) {
        event.preventDefault()
    }

    // Disable all function keys (F1 to F12)
    if (event.code.startsWith('F') && event.code.length === 3) {
        event.preventDefault()
    }
}

export async function getAssessmentShortInfo(
    assessmentId: any,
    moduleID: any,
    viewcourses: any,
    chapterId: any,
    setAssessmentShortInfo: any,
    setAssessmentOutSourceId: any,
    setSubmissionId: any
) {
    try {
        const res = await api.get(
            `Content/students/assessmentId=${assessmentId}?moduleId=${moduleID}&bootcampId=${viewcourses}&chapterId=${chapterId}`
        )
        setAssessmentShortInfo(res.data)
        setAssessmentOutSourceId(res.data.id)
        if (res.data.submitedOutsourseAssessments.length > 0) {
            setSubmissionId(res.data.submitedOutsourseAssessments[0].id)
        }
    } catch (e) {
        console.error(e)
    }
}

export async function getBatchDataNew(bootcampId: number) {
    const res = await api.get(`/bootcamp/batches/${bootcampId}`)
    return res.data
}

// --------------------------------------------

export const decodeBase64 = (data: string) => {
    if (!data) return ''
    return Buffer.from(data, 'base64').toString('utf-8')
}
