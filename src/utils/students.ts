import { toast } from '@/components/ui/use-toast'
import { api } from './axios.config'
import { OFFSET, POSITION } from './constant'
import { fetchStudentsHandler } from './admin'
import { getStoreStudentDataNew } from '@/store/store'
import { showProctoringAlert } from '@/app/student/course/[courseId]/studentAssessment/_studentAssessmentComponents/ProctoringAlerts'
import { QuestionPanel } from '@/app/student/course/[courseId]/codingChallenge/components'

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
            toast.success({
                title: res.data.status,
                description: res.data.message,
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
        toast.error({
            title: 'Failed',
            description: error.response?.data?.message || 'An error occurred.',
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
        console?.error(e)
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

// Auto publish assessment state change function:

export const handleAssessmentStateTransitions = (
    assessmentShortInfo: any,
    chapterContent: any,
    moduleID: string | string[],
    viewcourses: string | string[],
    setAssessmentShortInfo: (value: any) => void,
    setAssessmentOutSourceId: (value: any) => void,
    setSubmissionId: (value: any) => void,
    pollIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>,
    setCountdown: (value: string) => void,
    setShowPublishedCard: (value: boolean) => void,
    setShowActiveCard: (value: boolean) => void,
    setShowClosedCard: (value: boolean) => void
) => {
    const state = assessmentShortInfo?.assessmentState?.toUpperCase()

    const startPolling = () => {
        if (pollIntervalRef.current) {
            return // Timer is already active
        }

        // Since the API is reliable, we no longer need to poll.
        // We'll fetch the data once after a short delay to allow the backend to update.
        const timerId = setTimeout(() => {
            getAssessmentShortInfo(
                chapterContent?.assessmentId,
                moduleID,
                viewcourses,
                chapterContent.id,
                setAssessmentShortInfo,
                setAssessmentOutSourceId,
                setSubmissionId
            )
        }, 2000) // 2-second delay

        pollIntervalRef.current = timerId
    }

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearTimeout(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
    }

    if (state === 'PUBLISHED' && assessmentShortInfo.startDatetime) {
        stopPolling()
        setShowActiveCard(false)
        setShowClosedCard(false)
        setShowPublishedCard(true)

        const countdownInterval = setInterval(() => {
            const now = new Date().getTime()
            const startTime =
                new Date(assessmentShortInfo.startDatetime).getTime()
            const distance = startTime - now

            if (distance < 0) {
                clearInterval(countdownInterval)
                setShowPublishedCard(false) // Animate out
                startPolling() // Fetch the new state once after a delay
                return
            }

            const oneSecond = 1000
            const oneMinute = oneSecond * 60
            const oneHour = oneMinute * 60
            const oneDay = oneHour * 24

            const days = Math.floor(distance / oneDay)
            const hours = Math.floor((distance % oneDay) / oneHour)
            const minutes = Math.floor((distance % oneHour) / oneMinute)
            const seconds = Math.floor((distance % oneMinute) / oneSecond)
            setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        }, 1000)

        return () => clearInterval(countdownInterval)
    } else if (state === 'ACTIVE') {
        stopPolling()
        setShowPublishedCard(false)
        setShowClosedCard(false)
        setShowActiveCard(true)

        if (assessmentShortInfo.endDatetime) {
            const activeInterval = setInterval(() => {
                const now = new Date().getTime()
                const endTime =
                    new Date(assessmentShortInfo.endDatetime).getTime()
                if (now > endTime) {
                    clearInterval(activeInterval)
                    setShowActiveCard(false) // Animate out
                    startPolling() // Fetch the new state once after a delay
                }
            }, 300)

            return () => {
                clearInterval(activeInterval)
            }
        }
    } else if (state === 'CLOSED') {
        stopPolling()
        setShowPublishedCard(false)
        setShowActiveCard(false)
        setShowClosedCard(true)
    } else {
        // Handle other states like DRAFT
        setShowPublishedCard(false)
        setShowActiveCard(false)
        setShowClosedCard(false)
    }

    return stopPolling // Cleanup on unmount
}

// --------------------------------------------

export const getEmbedLink = (link: string) => {
    if (!link) return ''
    if (link.includes('youtube.com') || link.includes('youtu.be')) return link
    if (link.includes('drive.google.com')) {
        // Convert Google Drive link to embeddable format
        const match = link.match(/\/d\/([\w-]+)/)
        if (match) {
            return `https://drive.google.com/file/d/${match[1]}/preview`
        }
        return link
    }
    return link
}

// --------------------------------------------

export const formatToIST = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata',
        };

        const formatter = new Intl.DateTimeFormat('en-IN', options);
        const parts = formatter.formatToParts(date);

        const getPart = (type: string) =>
            parts.find(part => part.type === type)?.value || '';

        const day = getPart('day');
        const month = getPart('month');
        const year = getPart('year');
        const hour = getPart('hour');
        const minute = getPart('minute');
        const dayPeriod = getPart('dayPeriod');

        return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
    };

// --------------------------------------------









// --------------------------------------------QuestionPanel.tsx--------------------------------------------
export const formatValue = (value: any, type: string): string => {
  if (type === "jsonType") {
    return JSON.stringify(value); 
  }

  if (Array.isArray(value)) {
    if (type === "arrayOfNum") {
      return `[${value.join(", ")}]`;
    }
    if (type === "arrayOfStr") {
      return `[${value.map((v) => `"${v}"`).join(", ")}]`;
    }
    return `[${value.join(", ")}]`;
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  switch (type) {
    case "int":
    case "float":
      return value.toString();
    case "str":
      return `"${value}"`;
    default:
      return String(value);
  }
};








// StudentDashboard.tsx

export const formatUpcomingItem = (item: any) => {
  // Helper function to parse and normalize date strings
  const parseDate = (dateString: any) => {
    if (!dateString) return null;
    
    let parsableDateString = dateString;
    
    // Convert "2025-06-27 08:26:00+00" to "2025-06-27T08:26:00+00:00"
    if (parsableDateString.includes(' ') && parsableDateString.includes('+')) {
      parsableDateString = parsableDateString.replace(' ', 'T');
      // Add colon to timezone if missing ("+00" becomes "+00:00")
      if (parsableDateString.match(/[+-]\d{2}$/)) {
        parsableDateString += ':00';
      }
    }
    
    const date = new Date(parsableDateString);
    return isNaN(date.getTime()) ? null : date;
  };

  // Helper function to format countdown time
  const formatCountdown = (diffTime: any, prefix = '') => {
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (days > 0) {
      timeString = `${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours} hr${hours > 1 ? 's' : ''}` : ''}`;
    } else if (hours > 0) {
      timeString = `${hours} hour${hours > 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} min${minutes > 1 ? 's' : ''}` : ''}`;
    } else if (minutes > 0) {
      timeString = `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      timeString = "Starting soon";
    }

    return prefix ? `${prefix} ${timeString}` : timeString;
  };

  // Get the appropriate date field based on event type
  const getStartDate = (item:any) => {
    if (item.type?.toLowerCase() === 'live class') {
      return parseDate(item.startTime);
    } else {
      return parseDate(item.startDatetime);
    }
  };

  const getEndDate = (item:any) => {
    if (item.type?.toLowerCase() === 'live class') {
      return parseDate(item.endTime);
    } else if (item.type?.toLowerCase() === 'assignment') {
      return parseDate(item.completionDate);
    } else {
      return parseDate(item.endDatetime);
    }
  };

  const startDate = getStartDate(item);
  const endDate = getEndDate(item);
  const now = new Date();

  // If we can't parse the start date, fall back to eventDate
  if (!startDate) {
    const eventDate = parseDate(item.eventDate);
    if (!eventDate) {
      return "Date not available";
    }
    const diffTime = eventDate.getTime() - now.getTime();
    if (diffTime <= 0) {
      return item.type?.toLowerCase() === 'assignment' ? "Past due" : "Event has started";
    }
    return formatCountdown(diffTime, "Starts in");
  }

  const startTime = startDate.getTime();
  const currentTime = now.getTime();

  // Case 1: start date and time > current date
  if (startTime > currentTime) {
    const diffTime = startTime - currentTime;
    return formatCountdown(diffTime, "Starts in");
  }

  // Case 2: start date and time < current date & end date & time is not null
  if (startTime < currentTime && endDate) {
    const endTime = endDate.getTime();
    if (endTime > currentTime) {
      const diffTime = endTime - currentTime;
      return formatCountdown(diffTime, "Deadline in");
    } else {
      return item.type?.toLowerCase() === 'assignment' ? "Past due" : "Event ended";
    }
  }

  // Case 3: start date and time < current date & end date & time is null
  if (startTime < currentTime && !endDate) {
    // Format the start date for display
    const options: any = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    };

    const formattedDate = startDate.toLocaleDateString('en-US', options);
    return `Due Date: ${formattedDate}`;
  }

  // Fallback
  return "Status unavailable";
};

