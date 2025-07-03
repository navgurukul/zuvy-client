'use client'

// External imports
import { useEffect, useState } from 'react'
import { ChevronRight, Video, BookOpenText } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Internal imports
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLazyLoadedStudentData } from '@/store/store'
import Loader from './_components/Loader'
import { api } from '@/utils/axios.config'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import { Skeleton } from '@/components/ui/skeleton'
import {EnrolledCourse,ResumeCourse,LatestUpdatedCourseRes, StudentDashboardRes } from "@/app/student/courses/type"

type pageProps = {}

const Page: React.FC<pageProps> = () => {
    // misc
    const { studentData } = useLazyLoadedStudentData()

    // state and variables
    const [enrolledCourse, setEnrolledCourse] = useState<EnrolledCourse[]>([])
    const [resumeCourse, setResumeCourse] = useState<ResumeCourse>({})
    const [courseStarted, setCourseStarted] = useState<boolean>(false)
    const [flag, setFlag] = useState<boolean>(true)
    const [message, setMessage] = useState <string | undefined>()
    const userID = studentData?.id && studentData?.id

    // async
    useEffect(() => {
        const getEnrolledCourses = async () => {
            try {
                const response = await api.get<StudentDashboardRes>(`/student`)
                setEnrolledCourse(response.data.inProgressBootcamps)
                setFlag(false)
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        getEnrolledCourses()
    }, [])

    useEffect(() => {
        const getResumeCourse = async () => {
            try {
                const response = await api.get<LatestUpdatedCourseRes>('tracking/latestUpdatedCourse')
                if (Array.isArray(response.data.data)) {
                    setCourseStarted(false)
                    const message = response.data.message.toLowerCase()
                    if (!message.includes('start'))
                        setMessage(response.data.message)
                } else {
                    setCourseStarted(true)
                    setResumeCourse(response.data.data)
                }
            } catch (error) {
                console.error('Error getting resume course:', error)
                setCourseStarted(false)
            }
        }
        if (userID) getResumeCourse()
    }, [userID])

    return (
        <>
            <div className="mx-2 p-5 flex  items-center justify-between bg-gradient-to-bl from-blue-50 to-violet-50 rounded-lg">
                <h1 className="p-1  text-xl font-semibold">My Courses</h1>
            </div>
            <div className="px-2 py-2 md:px-6 md:py-10 ">
                {/* If Course Already Started then Below Message will be displayed: */}
                {(message || (enrolledCourse?.length > 0 && courseStarted)) && (
                    <div className="flex flex-col flex-start">
                        <h1 className="text-xl p-1 text-start font-bold mb-4">
                            Start From Where You Left Off
                        </h1>
                        {courseStarted ? (
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-6">
                                <div className="flex flex-col">
                                    <div className="w-full lg:w-[860px]">
                                        <Card className="w-full mb-3 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]">
                                            {/* For Large screen like Laptop and large tab */}
                                            <div className="hidden lg:flex flex-row justify-between items-center gap-6">
                                                <div>
                                                    <div className="flex flex-row gap-3">
                                                        {resumeCourse.newChapter
                                                            ?.title &&
                                                            resumeCourse.typeId ===
                                                                1 && (
                                                                <BookOpenText className="mt-2" />
                                                            )}
                                                        {resumeCourse.newChapter
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
                                                                    .newChapter
                                                                    ?.title
                                                                    ? 'text-md'
                                                                    : 'text-lg text-destructive'
                                                            } mt-2 text-start font-bold`}
                                                        >
                                                            {/* {resumeCourse
                                                                .newChapter
                                                                ?.title ||
                                                                resumeCourse.newChapter ||
                                                                'There is no chapter in the module'} */}

                                                                {resumeCourse?.newChapter?.title ??
                                                               JSON.stringify(resumeCourse?.newChapter) ??
                                                           'There is no chapter in the module'}

                                                        </h1>
                                                    </div>
                                                    <div className="flex flex-row gap-4">
                                                        <p className="text-md text-start mt-3 mb-2">
                                                            {
                                                                resumeCourse?.bootcampName
                                                            }
                                                        </p>
                                                        <span className="w-[5px] h-[5px] bg-gray-500 rounded-full self-center"></span>
                                                        <p className="text-md text-start mt-3 mb-2">
                                                            {
                                                                resumeCourse?.moduleName
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-end">
                                                    <Button
                                                        variant={'ghost'}
                                                        className="text-lg font-bold"
                                                    >
                                                        <Link
                                                            className="gap-3 flex items-center text-secondary"
                                                            href={
                                                                resumeCourse.typeId ===
                                                                1
                                                                    ? `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}/chapters/${resumeCourse.newChapter?.id}`
                                                                    : `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}/project/${resumeCourse.newChapter?.id}`
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
                                            {/* For Small screen like mobile and small tab */}
                                            <div className="lg:hidden">
                                                <div className="flex flex-row gap-4">
                                                    {resumeCourse.newChapter
                                                        ?.title &&
                                                        resumeCourse.typeId ===
                                                            1 && (
                                                            <BookOpenText className="mt-2" />
                                                        )}
                                                    {resumeCourse.newChapter
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
                                                                .newChapter
                                                                ?.title
                                                                ? 'text-md'
                                                                : 'text-lg text-destructive'
                                                        } mt-2 text-start font-bold`}
                                                    >
                                                        {/* {resumeCourse?.newChapter
                                                            ?.title ||
                                                            resumeCourse?.newChapter ||
                                                            'There is no chapter in the module'} */}


                                                            {resumeCourse?.newChapter?.title??
                                                          JSON.stringify(resumeCourse?.newChapter) ??
                                                         'There is no chapter in the module'}

                                                            
                                                    </h1>
                                                </div>
                                                <div className="flex flex-row">
                                                    <p className="text-md text-start mt-3 mb-2">
                                                        {
                                                            resumeCourse?.bootcampName
                                                        }
                                                        &nbsp;-&nbsp;
                                                        {
                                                            resumeCourse?.moduleName
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-end">
                                                    <Button
                                                        variant={'ghost'}
                                                        className="text-lg font-bold"
                                                    >
                                                        <Link
                                                            className="gap-3 flex items-center text-secondary"
                                                            href={
                                                                resumeCourse.typeId ===
                                                                1
                                                                    ? `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}/chapters/${resumeCourse.newChapter?.id}`
                                                                    : `/student/courses/${resumeCourse?.bootcampId}/modules/${resumeCourse.moduleId}/project/${resumeCourse.newChapter?.id}`
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
                        ) : (
                            // If No Course Started then Below Message will be displayed:
                            <h1 className="text-lg p-1 text-start font-semiBold text-destructive mb-4">
                                {message}
                            </h1>
                        )}
                    </div>
                )}

                <div className=" flex flex-col items-center justify-center mt-6">
                    <div className="container  mx-auto p-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-9">
                            {flag ? (
                                <div className="animate-pulse flex gap-8">
                                    {[...Array(3)].map((_, index) => (
                                        <div key={index} className="mb-4">
                                            <Skeleton className="h-[200px] w-[300px] rounded-sm" />
                                            <div className="px-1 py-4">
                                                <Skeleton className="h-6 w-3/4 mb-2 rounded" />
                                            </div>
                                            <Skeleton className="h-3 w-full rounded-full mt-2" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {enrolledCourse.length > 0 ? (
                                        enrolledCourse.map(
                                            ({
                                                name,
                                                coverImage,
                                                id,
                                                progress,
                                                batchId,
                                            }: {
                                                name: string
                                                coverImage: string
                                                id: number
                                                progress: number
                                                batchId: number
                                            }) => (
                                                <Link
                                                    key={id}
                                                    href={`courses/${id}/batch/${batchId}`}
                                                    className="text-gray-900 text-base"
                                                >
                                                    <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                                                        <OptimizedImageWithFallback
                                                            src={coverImage}
                                                            alt="Placeholder Image"
                                                            // className="rounded-md object-cover"
                                                            // width={300}
                                                            // height={48}
                                                            fallBackSrc={
                                                                '/logo_white.png'
                                                            }
                                                        />
                                                    </div>
                                                    <div className="px-1 py-4">
                                                        {name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            position:
                                                                'relative',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Loader
                                                            progress={progress}
                                                        />
                                                        <div
                                                            style={{
                                                                position:
                                                                    'absolute',
                                                                bottom: '-30px', // Adjust position as needed
                                                                width: '100%',
                                                                textAlign:
                                                                    'left',
                                                                fontSize:
                                                                    '14px',
                                                                fontWeight:
                                                                    'bold', // Make text bold
                                                                color: 'black', /// Adjust font size if needed
                                                            }}
                                                        >
                                                            {progress > 0
                                                                ? `${progress}% completed`
                                                                : 'Start Course'}
                                                        </div>
                                                    </div>
                                                </Link>
                                            )
                                        )
                                    ) : (
                                        <p>No courses available.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Page
