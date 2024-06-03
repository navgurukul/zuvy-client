'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { getAttendanceColorClass } from '@/lib/utils'

import { api } from '@/utils/axios.config'
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
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
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
                                {upcomingClasses.map(
                                    (classData: any, index) => (
                                        <ClassCard
                                            classData={classData}
                                            classType={classData.status}
                                            key={index}
                                        />
                                    )
                                )}
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
                </div>

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

                <div className="w-full h-[200px] flex flex-col px-6 bg-gray-100 rounded-lg items-start justify-center text-start gap-2">
                    <h1 className="text-xl  font-semibold">Attendance</h1>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-[15px] h-[15px] rounded-full  ${getAttendanceColorClass(
                                attendenceData[0]?.attendance
                            )}`}
                        />
                        <h1>{attendenceData[0]?.attendance}%</h1>
                    </div>
                    <p className="text-md font-semibold">
                        {' '}
                        {attendenceData[0]?.attendedClasses} of{' '}
                        {attendenceData[0]?.totalClasses} Classes Attended
                    </p>
                </div>
            </div>
        </>
    )
}

export default Schedule
