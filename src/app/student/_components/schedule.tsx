'use client'

import { useEffect, useState } from 'react'
// import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/utils/axios.config'
import { useLazyLoadedStudentData } from '@/store/store'
import Link from 'next/link'
import ClassCard from '@/app/admin/courses/[courseId]/_components/classCard'
import Image from 'next/image'
interface ResumeCourse {
    bootcamp_name?: string
    module_name?: string
    bootcampId?: number
    moduleId?: number
}
type ScheduleProps = React.ComponentProps<typeof Card>

function Schedule({ className, ...props }: ScheduleProps) {
    // const [courseStarted, setCourseStarted] = useState<boolean>(false)
    // const { studentData } = useLazyLoadedStudentData()
    // const userID = studentData?.id && studentData?.id
    // const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({})
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [attendenceData, setAttendenceData] = useState<any[]>([])
    // const [ongoingClasses, setOngoingClasses] = useState([])
    // const [completedClasses, setCompletedClasses] = useState([])
    // useEffect(() => {
    //     if (userID) {
    //         api.get(`/student/${userID}`)
    //             .then((res) => {
    //                 api.get(`/bootcamp/studentClasses/${res.data[0].id}`, {
    //                     params: {
    //                         userId: userID,
    //                     },
    //                 })
    //                     .then((response) => {
    //                         const {
    //                             upcomingClasses,
    //                             ongoingClasses,
    //                             completedClasses,
    //                         } = response.data
    //                         setUpcomingClasses(upcomingClasses)
    //                         setOngoingClasses(ongoingClasses)
    //                         setCompletedClasses(completedClasses)
    //                     })
    //                     .catch((error) => {
    //                         console.log('Error fetching classes:', error)
    //                     })
    //             })
    //             .catch((error) => {
    //                 console.log('Error fetching classes:', error)
    //             })
    //     }
    // }, [userID])

    // useEffect(() => {}, [upcomingClasses, ongoingClasses, completedClasses])

    // useEffect(() => {
    //     const getResumeCourse = async () => {
    //         try {
    //             const response = await api.get(
    //                 `/tracking/latest/learning/${userID}`
    //             )
    //             setResumeCourse(response.data)
    //             // If we get res, then course started, hence courseStarted: true;
    //             setCourseStarted(true)
    //         } catch (error) {
    //             console.error('Error getting resume course:', error)
    //             if (
    //                 (error as any)?.response?.data?.message ===
    //                 `Cannot read properties of undefined (reading 'moduleId')`
    //             ) {
    //                 setCourseStarted(false)
    //             }
    //         }
    //     }
    //     if (userID) getResumeCourse()
    // }, [userID])
    const getAttendanceColorClass = (attendance: any) => {
        if (attendance === 100) {
            return 'bg-green-500 text-white'
        } else if (attendance >= 75) {
            return 'bg-yellow-500 text-black'
        } else if (attendance < 50) {
            return 'bg-red-500 text-white'
        } else {
            return 'bg-gray-500 text-white' // Default color for other cases
        }
    }

    const getUpcomingClassesHandler = async () => {
        await api.get(`/student/Dashboard/classes`).then((res) => {
            setUpcomingClasses(res.data.upcoming)
            setOngoingClasses(res.data.ongoing)
        })
    }
    const getAttendenceHandler = async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            setAttendenceData(res.data)
        })
    }
    useEffect(() => {
        getUpcomingClassesHandler()
        getAttendenceHandler()
    }, [])

    return (
        <>
            <div className="flex flex-row justify-between gap-6">
                {upcomingClasses?.length > 0 ? (
                    <div className="flex flex-col">
                        <p className="text-lg p-1 text-start font-bold">
                            Upcoming Classes
                        </p>
                        <div className="w-[800px]">
                            {ongoingClasses.map((classData: any, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                />
                            ))}
                            {upcomingClasses.map((classData: any, index) => (
                                <ClassCard
                                    classData={classData}
                                    classType={classData.status}
                                    key={index}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center mt-12">
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
                )}

                {/* Other components can be placed here */}

                {/* Example card component for future use */}
                {/* <Card className="text-start">
            <CardHeader className="bg-muted">
                <CardTitle>Pick up where you left</CardTitle>
            </CardHeader>
            <CardContent className="p-3 grid gap-4">
                <div className="flex flex-wrap items-center p-4 justify-between gap-8">
                    <div className="flex items-center">
                        <BookOpenText className="hidden sm:block" />
                        <div className="flex-1 ml-2 space-y-1">
                            <p className="text-sm font-medium leading-none">
                            {resumeCourse?.bootcamp_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {resumeCourse.module_name}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}`}
                    >
                        <Button>Continue</Button>
                        </Link>
                        </div>
                        </CardContent>
                    </Card> */}

                <div className="w-full h-full p-6 bg-gray-100 rounded-lg items-center justify-center ">
                    <h1 className=" text-xl text-start font-semibold">
                        Attendance
                    </h1>
                    <div className=" gap-2 items-center">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-[10px] h-[10px] rounded-full  ${getAttendanceColorClass(
                                    attendenceData[0]?.attendance
                                )}`}
                            />
                            <h1>{attendenceData[0]?.attendance}%</h1>
                        </div>
                        <div className="flex">
                            <p className="text-md font-semibold">
                                {' '}
                                {attendenceData[0]?.attendedClasses} of{' '}
                                {attendenceData[0]?.totalClasses} Classes
                                Attended
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      /> */}
        </>
    )
}

export default Schedule
