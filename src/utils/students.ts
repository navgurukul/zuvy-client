import { toast } from '@/components/ui/use-toast'
import { api } from './axios.config'
import { OFFSET, POSITION } from './constant'
import { fetchStudentsHandler } from './admin'
import { getStoreStudentDataNew } from '@/store/store'
import { showProctoringAlert } from '@/app/student/courses/[viewcourses]/modules/[moduleID]/assessment/[assessmentOutSourceId]/ProctoringAlerts'

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

export async function getProctoringData(assessmentSubmissionId: any) {
    try {
        const res = await api.get(`tracking/assessment/properting/${assessmentSubmissionId}`);
        const eyeMomentCount = res?.data?.data?.eyeMomentCount;
        const fullScreenExit = res?.data?.data?.fullScreenExit;
        const copyPaste = res?.data?.data?.copyPaste;
        const tabChange = res?.data?.data?.tabChange;

        // Check if the values are valid
        if (tabChange === undefined || copyPaste === undefined) {
            throw new Error('Invalid data structure received from API');
        }

        return {eyeMomentCount, fullScreenExit, copyPaste, tabChange};  // Return as an object
    } catch (error) {
        console.error('Error fetching Proctoring data:', error);
        throw error;  // Rethrow the error to be handled by the calling function
    }
}


export async function updateProctoringData(
    assessmentSubmitId:any,
    tabChangeInstance: any,
    copyPasteAttempt: any,
    fullScreenExit: any,
    eyeMomentCount: any,
){
    try {
        const res = await api.patch(
            `submission/assessment/properting?assessment_submission_id=${assessmentSubmitId}`,
            {
                tabChange: tabChangeInstance,
                copyPaste: copyPasteAttempt,
                fullScreenExit: fullScreenExit,
                eyeMomentCount: eyeMomentCount
            }
        )
    } catch (error) {
        console.error('Error updating Proctoring data:', error)
        return null
    }
}


// tab change event listener
export async function handleVisibilityChange(
    submitAssessment: () => void,
    isCurrentPageSubmitAssessment: () => boolean,
    assessmentSubmitId: any,
) {
    if (document.hidden) {
        try {
            const { tabChange, copyPaste, fullScreenExit, eyeMomentCount} = await getProctoringData(assessmentSubmitId);
            const newTabChangeInstance = tabChange + 1;

            // Update the proctoring data with the new values
            await updateProctoringData(assessmentSubmitId, newTabChangeInstance, copyPaste, fullScreenExit, eyeMomentCount);

            if (newTabChangeInstance > 3) {
                if (isCurrentPageSubmitAssessment()) {
                    submitAssessment();
                    return showProctoringAlert({
                        title: 'Test Ended -> Tab will close now',
                        description: 'You have changed the tab multiple times.',
                        violationCount: `${newTabChangeInstance} of 3`
                    });
                }
            } else {
                return showProctoringAlert({
                    title: 'Tab Switch Detected',
                    description: 'You have changed the tab. If you change the tab again, your test may get submitted automatically.',
                    violationCount: `${newTabChangeInstance} of 3`
                });
            }
        } catch (error) {
            console.error('Failed to handle visibility change:', error);
        }
    }
}


// Request full screen as full screen is only allowed by user click

export async function handleFullScreenChange(
    submitAssessment: () => void,
    isCurrentPageSubmitAssessment: () => Boolean,
    setIsFullScreen: any,
    assessmentSubmitId: any,
) {
    if (!document.fullscreenElement) {
        setIsFullScreen(false)
        const { tabChange, copyPaste, fullScreenExit, eyeMomentCount} = await getProctoringData(assessmentSubmitId);
        const newFullScreenExitInstance = fullScreenExit + 1
        await updateProctoringData(assessmentSubmitId, tabChange, copyPaste, newFullScreenExitInstance, eyeMomentCount);


          if (newFullScreenExitInstance > 3) {
            // Check if the current page is the submitAssessment page
            if (isCurrentPageSubmitAssessment()) {
                submitAssessment()
               return showProctoringAlert({
                    title: 'Test Ended',
                    description: 'You have exited full screen multiple times.',
                    violationCount: `${newFullScreenExitInstance} of 3`
                })
            }
        }else{
            return showProctoringAlert({
                title: 'Full Screen Exit Detected',
                description:
                    'You have exited full screen. If you exit full screen again, your test may get submitted automatically.',
               violationCount: `${newFullScreenExitInstance} of 3`
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
    } catch (e:any) {
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

// --------------------------------------------

export const fetchCourseDetails = async (courseId: number, setCourseName:any) => {
    try {
        const response = await api.get(`/bootcamp/${courseId}`)
        const data = response.data
        setCourseName(data?.bootcamp?.name)
    } catch (error) {
        console.error('Error fetching course details:', error)
    }
}

// --------------------------------------------

export const fetchChapters = async (moduleID:any, setChapters:any) => {
    try {
        const response = await api.get(
            `tracking/getAllChaptersWithStatus/${moduleID}`
        )
        setChapters(response.data.trackingData)
        // setProjectId(response?.data.moduleDetails[0]?.projectId)
    } catch (error) {
        console.error(error)
    }
}

