'use client'

import { useEffect, useState } from 'react'
// import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { BookOpenText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/utils/axios.config'
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
    const [courseStarted, setCourseStarted] = useState<boolean>(false)
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({})
    const [upcomingClasses, setUpcomingClasses] = useState([])
    const [ongoingClasses, setOngoingClasses] = useState([])
    const [completedClasses, setCompletedClasses] = useState([])
    useEffect(() => {
        if (userID) {
            api.get(`/student/${userID}`)
                .then((res) => {
                    api.get(`/bootcamp/studentClasses/${res.data[0].id}`, {
                        params: {
                            userId: userID,
                        },
                    })
                        .then((response) => {
                            const {
                                upcomingClasses,
                                ongoingClasses,
                                completedClasses,
                            } = response.data
                            setUpcomingClasses(upcomingClasses)
                            setOngoingClasses(ongoingClasses)
                            setCompletedClasses(completedClasses)
                        })
                        .catch((error) => {
                            console.log('Error fetching classes:', error)
                        })
                })
                .catch((error) => {
                    console.log('Error fetching classes:', error)
                })
        }
    }, [userID])

    useEffect(() => {}, [upcomingClasses, ongoingClasses, completedClasses])

    useEffect(() => {
        const getResumeCourse = async () => {
            try {
                const response = await api.get(
                    `/tracking/latest/learning/${userID}`
                )
                setResumeCourse(response.data)
                // If we get res, then course started, hence courseStarted: true;
                setCourseStarted(true)
            } catch (error) {
                console.error('Error getting resume course:', error)
                if (
                    (error as any)?.response?.data?.message ===
                    `Cannot read properties of undefined (reading 'moduleId')`
                ) {
                    setCourseStarted(false)
                }
            }
        }
        if (userID) getResumeCourse()
    }, [userID])
    return (
        <>
            <div>
                {ongoingClasses?.length > 0 || upcomingClasses?.length > 0 ? (
                    <div className="flex left-0  ">
                        <p className="text-lg p-1 font-bold">
                            Upcoming Classes
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center mt-12">
                            <Image
                                src={'/no-class.svg'}
                                alt="party popper"
                                width={'240'}
                                height={'240'}
                            />
                        </div>
                        <p className="text-lg mt-3 text-center">
                            There are no upcoming classes
                        </p>
                    </>
                )}

                <div className="md:w-[720px] flex flex-col gap-y-3">
                    {ongoingClasses?.length > 0
                        ? ongoingClasses.map((classObj, index) => (
                              <ClassCard
                                  classData={classObj}
                                  key={index}
                                  classType="ongoing"
                              />
                          ))
                        : null}

                    {upcomingClasses?.length > 0
                        ? upcomingClasses.map((classObj, index) => (
                              <ClassCard
                                  classData={classObj}
                                  key={index}
                                  classType="Upcoming"
                              />
                          ))
                        : null}
                </div>
                {courseStarted ? (
                    <Card
                        className={cn(' text-start w-full mt-3', className)}
                        {...props}
                    >
                        <CardHeader className="bg-muted">
                            <CardTitle>Pick up where you left</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 grid gap-4">
                            <div className=" flex flex-wrap items-center p-4 justify-between max-sm:justify-center gap-8">
                                <div className="flex max-sm:text-center">
                                    <BookOpenText className="self-start max-sm:hidden" />
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
                    </Card>
                ) : null}
                {/* <Card className={cn("text-start w-full mt-3", className)} {...props}>
          <CardHeader className="bg-muted">
            <CardTitle>Upcoming Submissions</CardTitle>
          </CardHeader>
          <CardContent className="grid p-3 gap-4">
            <div className="flex flex-wrap justify-between items-center p-4">
              <div className="flex items-center">
                <GraduationCap />
                <p className="text-sm ml-2 font-medium leading-none">
                  Quiz: Intro to variables
                </p>
              </div>
              <div className="flex items-center max-sm:mt-2">
                <CalendarClock />
                <p className="text-sm ml-2 text-muted-foreground">
                  5th Feb, 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card> */}
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
