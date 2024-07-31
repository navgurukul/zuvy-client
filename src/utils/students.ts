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
        toast({
            title: 'WARNING',
            description:
                'You have changed the tab. If you change the tab again, your test will get submitted automatically.',
            className: 'text-start capitalize border border-destructive',
        })

        if (newTabChangeInstance > 4) {
            // Check if the current page is the submitAssessment page
            if (isCurrentPageSubmitAssessment()) {
                // Submit the assessment
                toast({
                    title: 'Test Ended',
                    description: 'You have changed the tab multiple times.',
                    className:
                        'text-start capitalize border border-destructive',
                })
                submitAssessment()
            }
        }
    }
}

// Request full screen as full screen is only allowed by user click

export function handleFullScreenChange(
    setFullScreenExitInstance: any,
    fullScreenExitInstance: any,
    submitAssessment: () => void,
    isCurrentPageSubmitAssessment: () => Boolean
) {
    if (!document.fullscreenElement) {
        const newFullScreenExitInstance = fullScreenExitInstance + 1
        localStorage.setItem(
            'fullScreenExitInstance',
            newFullScreenExitInstance.toString()
        )
        setFullScreenExitInstance(newFullScreenExitInstance)
        toast({
            title: 'WARNING',
            description:
                'You have exited full screen. If you exit full screen, your test will get submitted automatically.',
            className: 'text-start capitalize border border-destructive',
        })

        if (newFullScreenExitInstance > 4) {
            // Check if the current page is the submitAssessment page
            if (isCurrentPageSubmitAssessment()) {
                // Submit the assessment
                toast({
                    title: 'Test Ended',
                    description: 'You have exited full screen multiple times.',
                    className:
                        'text-start capitalize border border-destructive',
                })
                submitAssessment()
            }
        }
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
