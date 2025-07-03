'use client'

import { useEffect, useState, useCallback } from 'react'
// import { Calendar } from "@/components/ui/calendar";
import { Card } from '@/components/ui/card'
import { cn, getAttendanceColorClass } from '@/lib/utils'
import { ChevronRight, Video } from 'lucide-react'
import { BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import Link from 'next/link'
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import Image from 'next/image'
import SubmissionCard from '@/app/admin/courses/[courseId]/_components/SubmissionCard'
import {ResumeCourse, EnrolledCourse, AttendanceData, Assignment, ClassData} from "@/app/student/_components/type";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'


type ScheduleProps = React.ComponentProps<typeof Card>

function Schedule({ className, ...props }: ScheduleProps) {
    const [courseStarted, setCourseStarted] = useState<boolean>(false)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [resumeCourse, setResumeCourse] = useState <ResumeCourse | null>(null)
    const [nextChapterId, setNextChapterId] = useState([])
    const [allClasses, setAllClasses] = useState<ClassData[]>([])
    const [upcomingClasses, setUpcomingClasses] = useState <ClassData[]>([])
    const [ongoingClasses, setOngoingClasses] = useState <ClassData[]>([])
    const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([])
    const [lateAssignments, setLateAssignments] = useState<Assignment[]>([])
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [submissionMessage, setSubmissionMessage] = useState()
    const [selectedCourse, setSelectedCourse] = useState<EnrolledCourse | null>()

    useEffect(() => {
        const getResumeCourse = async () => {
            try {
                const response = await api.get('/tracking/latestUpdatedCourse')
                // If we get res, then course started, hence courseStarted: true;
                if (Array.isArray(response.data.data)) {
                    setCourseStarted(false)
                    const message = response.data.message.toLowerCase()
                    if (!message.includes('start'))
                        setSubmissionMessage(response.data.message)
                } else {
                    setCourseStarted(true)
                    setResumeCourse(response.data.data)
                    setNextChapterId(response.data.data?.newChapter?.id)
                }
            } catch (error) {
                console.error('Error getting resume course:', error)
                setCourseStarted(false)
            }
        }
        if (userID) getResumeCourse()
    }, [userID])

    const getUpcomingClassesHandler = useCallback(async () => {
        const response = await api.get(`/student/Dashboard/classes`)
        if (Array.isArray(response.data.data)) {
            // setCourseStarted(false)
        } else {
            // setCourseStarted(true)
            const classes = [
                ...response.data.data.filterClasses.ongoing,
                ...response.data.data.filterClasses.upcoming,
            ]
            setAllClasses(classes)
            await api
                .get(`/student/Dashboard/classes?limit=2&offset=0`)
                .then((res) => {
                    setUpcomingClasses(res.data.data.filterClasses.upcoming)
                    setOngoingClasses(res.data.data.filterClasses.ongoing)
                })
        }
    }, [])
    const getAttendanceHandler = useCallback(async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            const attendance = res?.data?.filter(
                (course:AttendanceData) => selectedCourse?.id === course?.bootcampId
            )
            setAttendanceData(attendance)
        })
    }, [selectedCourse?.id])
    const getUpcomingSubmissionHandler = useCallback(async () => {
        await api.get(`/tracking/allupcomingSubmission`).then((res) => {
            if (res?.data?.data) {
                setUpcomingAssignments(res?.data?.data?.upcomingAssignments)
                setLateAssignments(res?.data?.data?.lateAssignments)
            }
        })
    }, [])

    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get(`/student`)
                setEnrolledCourse(response.data)
                setSelectedCourse(response.data[0])
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        if (userID) getEnrolledCourses()
    }, [userID])

    const handleCourseChange = (selectedCourseId: string) => {
        const newSelectedCourse: EnrolledCourse |undefined  = enrolledCourse.find(
            (course: EnrolledCourse) => course.id === +selectedCourseId
        )
        setSelectedCourse(newSelectedCourse || null)
    }

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                getUpcomingClassesHandler(),
                getAttendanceHandler(),
                // getUpcomingSubmissionHandler(),
            ])
        }

        if (courseStarted) getUpcomingSubmissionHandler()

        fetchData()
    }, [
          courseStarted,            
          selectedCourse?.id,    
        getAttendanceHandler,
        getUpcomingClassesHandler,
        getUpcomingSubmissionHandler,
    ])

    return (
        <div>
            {allClasses.length > 0 && (
                <div className="flex flex-col items-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold mb-4">
                        Upcoming Classes
                    </h1>
                    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-between gap-8">
                        <div className="flex flex-col w-full lg:max-w-[860px]">
                            {ongoingClasses.map((classData: ClassData, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                    getClasses={() => console.log('')}
                                    activeTab={'ongoing'}
                                    studentSide={true}
                                />
                            ))}
                            {upcomingClasses.map((classData: ClassData, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                    getClasses={() => console.log('')}
                                    activeTab={'ongoing'}
                                    studentSide={true}
                                />
                            ))}
                        </div>
                    </div>
                    {allClasses?.length > 2 && (
                        <div className="w-full flex justify-center mt-3">
                            <Link href="/student/classes">
                                <div className="flex items-center border rounded-md border-secondary px-3 py-1 text-secondary">
                                    <h1 className="text-lg p-1 font-bold">
                                        See All Upcoming Classes
                                    </h1>
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {(submissionMessage || courseStarted) && (
                <div className="flex flex-col flex-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold mb-4">
                        Start From Where You Left Off
                    </h1>
                    {courseStarted ? (
                        <>
                            <div className="hidden lg:flex flex-row justify-between gap-6">
                                <div className="flex flex-col">
                                    <div className="lg:w-[860px]">
                                        <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                            <div className="flex flex-row justify-between items-center gap-6">
                                                <div>
                                                    <div className="flex flex-row gap-3">
                                                        {resumeCourse?.newChapter
                                                            ?.title &&
                                                            resumeCourse.typeId ===
                                                                1 && (
                                                                <BookOpenText className="mt-2" />
                                                            )}
                                                        {resumeCourse?.newChapter
                                                            ?.title &&
                                                            resumeCourse.typeId===
                                                                2 && (
                                                                <h1 className="text-md mt-2 text-start font-bold">
                                                                    Project:
                                                                </h1>
                                                            )}
                                                        <h1
                                                            className={`${
                                                                resumeCourse
                                                                    ?.newChapter
                                                                    ?.title
                                                                    ? 'text-md'
                                                                    : 'text-lg text-destructive'
                                                            } mt-2 text-start font-bold`}
                                                        >
                                                            
                                                        {resumeCourse?.newChapter?.title ||
                                                        JSON.stringify(resumeCourse?.newChapter) ||
                                                        "There is no chapter in the module"}
                                                        </h1>
                                                    </div>
                                                    <div className="flex flex-row gap-4">
                                                        <p className="text-md text-start mt-3 mb-2 ">
                                                            {
                                                                resumeCourse?.bootcampId
                                                            }
                                                        </p>
                                                        <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                                                        <p className="text-md text-start mt-3 mb-2 ">
                                                            {
                                                                resumeCourse?.moduleName
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex item-center text-end">
                                                    <Button
                                                        variant={'ghost'}
                                                        className="text-lg font-bold"
                                                    >
                                                        <Link
                                                            className="gap-3 flex items-center text-secondary"
                                                            href={
                                                                resumeCourse?.typeId === 1
                                                                    ? `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse?.moduleId}/chapters/${resumeCourse?.newChapter?.id}`
                                                                    : `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse?.moduleId}/project/${resumeCourse?.newChapter?.id}`
                                                            }
                                                        >
                                                            <p>
                                                                Resume Learning
                                                            </p>
                                                            <ChevronRight
                                                                size={15}
                                                            />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:hidden flex flex-col justify-between gap-6">
                                <div className="flex flex-col">
                                    <div className="w-full">
                                        <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                            <div>
                                                <div className="flex flex-row gap-3">
                                                    {resumeCourse?.newChapter
                                                        ?.title &&
                                                        resumeCourse.typeId ===
                                                            1 && (
                                                            <BookOpenText className="mt-2" />
                                                        )}
                                                    {resumeCourse?.newChapter
                                                        ?.title &&
                                                        resumeCourse.typeId ===
                                                            2 && (
                                                            <h1 className="text-md mt-2 text-start font-bold">
                                                                Project:
                                                            </h1>
                                                        )}
                                                    <h1
                                                        className={`${
                                                            resumeCourse
                                                                ?.newChapter
                                                                ?.title
                                                                ? 'text-md'
                                                                : 'text-lg text-destructive'
                                                        } mt-2 text-start font-bold`}
                                                    >

                                                         {resumeCourse?.newChapter?.title ||
                                                        JSON.stringify(resumeCourse?.newChapter) ||
                                                        "There is no chapter in the module"}
                                                    </h1>
                                                </div>
                                                <div className="flex flex-row">
                                                    <p className="text-md text-start mt-3 mb-2 ">
                                                        {
                                                            resumeCourse?.bootcampName
                                                        }
                                                        &nbsp;-&nbsp;
                                                        {
                                                            resumeCourse?.moduleName
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <Button
                                                    variant={'ghost'}
                                                    className="text-lg font-bold"
                                                >
                                                    <Link
                                                        className="gap-3 flex items-center text-secondary"
                                                        href={
                                                            resumeCourse?.typeId === 1
                                                                ? `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse?.moduleId}/chapters/${resumeCourse?.newChapter?.id}`
                                                                : `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse?.moduleId}/project/${resumeCourse?.newChapter?.id}`
                                                        }                                                    >
                                                        <p>Resume Learning</p>
                                                        <ChevronRight
                                                            size={15}
                                                        />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-lg p-1 text-start font-semiBold text-destructive mb-4">
                            {submissionMessage}
                        </h1>
                    )}
                </div>
            )}
            {(lateAssignments?.length > 0 ||
                upcomingAssignments?.length > 0) && (
                <div className="flex flex-col items-start mt-6">
                    <div className="flex flex-col w-full lg:max-w-[860px]">
                        <div className="flex flex-col w-full lg:max-w-[860px]">
                            {lateAssignments?.length > 0 && (
                                <h1 className="text-xl p-1 text-start font-bold mb-4">
                                    Late Assignments
                                </h1>
                            )}
                            {lateAssignments.map((data: Assignment, index) => (
                                <SubmissionCard
                                    classData={data}
                                    key={index}
                                    status={'lateAssignmet'}
                                    view={'dashboard'}
                                />
                            ))}
                            {upcomingAssignments?.length > 0 && (
                                <h1 className="text-xl p-1 text-start font-bold mb-4">
                                    Upcoming Assignments
                                </h1>
                            )}
                            {upcomingAssignments.map((data: Assignment, index) => (
                                <SubmissionCard
                                    classData={data}
                                    key={index}
                                    status={'upcomingAssignment'}
                                    view={'dashboard'}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {allClasses.length < 1 && (
                <div className="flex flex-col items-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold mb-4">
                        Upcoming Classes
                    </h1>
                    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-between gap-8">
                        <div className="flex flex-col items-center mt-12 lg:w-[870px]">
                            <Image
                                src="/no-class.svg"
                                alt="No classes"
                                width={240}
                                height={240}
                            />
                            <p className="text-lg mt-3 text-center">
                                There are no upcoming classes
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {lateAssignments?.length < 1 && upcomingAssignments.length < 1 && (
                <div className="flex flex-col items-start mt-6">
                    <h1 className="text-xl p-1 text-start font-bold mb-4">
                        Upcoming Submissions
                    </h1>
                    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-between gap-8">
                        <div className="flex flex-col items-center mt-12 lg:w-[870px]">
                            <Image
                                src="/no-submission.svg"
                                alt="No Submission"
                                width={240}
                                height={240}
                            />
                            <p className="text-lg mt-3 text-center">
                                {submissionMessage ??
                                    'There are no upcoming Submission'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default Schedule








































