'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/utils/axios.config'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronRight, ChevronUp, Crown } from 'lucide-react'
import { useLazyLoadedStudentData } from '@/store/store'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

// import { Switch } from "@/components/ui/switch"

const notifications = [
    {
        title: 'Your call has been confirmed.',
        description: '1 hour ago',
    },
    {
        title: 'You have a new message!',
        description: '1 hour ago',
    },
    {
        title: 'Your subscription is expiring soon!',
        description: '2 hours ago',
    },
]

interface UserInfo {
    id: number
    name: string
    email: string
    averageScore: number
}
interface Student {
    attendance: number
    userInfo: UserInfo
}

interface EnrolledCourse {
    id: number
    name: string
}

type CardProps = React.ComponentProps<typeof Card>

export function Stat({ className, ...props }: CardProps) {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [students, setStudents] = useState<Student[]>([])
    const [enrolledCourse, setEnrolledCourse] = useState([])
    const [selectedCourse, setSelectedCourse] =
        useState<EnrolledCourse | null>()

    useEffect(() => {
        const getStudents = async () => {
            try {
                const response = await api.get(
                    `/student/leaderboard/${selectedCourse?.id}`
                )
                setStudents(response.data[0].students)
            } catch (error) {
                console.error('Error getting enrolled courses:', error)
            }
        }
        if (userID) getStudents()
    }, [userID, selectedCourse])

    const rank =
        students.length > 0 &&
        students.findIndex((item: any) => userID == item.userInfo.id)
    const ownRank = rank !== false ? rank + 1 : 'N/A'

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

    const handleCourseChange = (selectedCourseId: any) => {
        const newSelectedCourse: any = enrolledCourse.find(
            (course: any) => course.id === +selectedCourseId
        )
        setSelectedCourse(newSelectedCourse)
    }

    return (
        <>
            {students.length > 0 &&
                (students.length < 4 ? (
                    // <Skeleton className="h-4 w-4/6" />
                    <Card
                        className={cn(
                            'lg:h-[180px] lg:w-[380px] text-start bg-popover-foreground text-white',
                            className
                        )}
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Participents who are enrolled this course should
                                be at least more than 2
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {enrolledCourse?.length > 1 ? (
                                <Select
                                    onValueChange={(e) => {
                                        handleCourseChange(e)
                                    }}
                                >
                                    <SelectTrigger className="w-full border-4 shadow-none bg-popover-foreground my-3 rounded-lg">
                                        <SelectValue
                                            placeholder={
                                                selectedCourse?.name ||
                                                'Select a course'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Courses</SelectLabel>
                                            {enrolledCourse?.map(
                                                (course: any) => (
                                                    <SelectItem
                                                        key={course.id}
                                                        value={course.id.toString()}
                                                        className="text-md text-start font-semibold"
                                                    >
                                                        <h1 className="text-md text-start font-semibold">
                                                            {course.name}
                                                        </h1>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-start w-[300px]">
                                    {selectedCourse?.name}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card
                        className={cn(
                            'lg:h-[500px] lg:w-[380px] text-start bg-popover-foreground text-white',
                            className
                        )}
                        {...props}
                    >
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Leaderboard
                                <ChevronRight />
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            {enrolledCourse?.length > 1 ? (
                                <Select
                                    onValueChange={(e) => {
                                        handleCourseChange(e)
                                    }}
                                >
                                    <SelectTrigger className="w-full border-4 shadow-none bg-popover-foreground my-3 rounded-lg">
                                        <SelectValue
                                            placeholder={
                                                selectedCourse?.name ||
                                                'Select a course'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Courses</SelectLabel>
                                            {enrolledCourse?.map(
                                                (course: any) => (
                                                    <SelectItem
                                                        key={course.id}
                                                        value={course.id.toString()}
                                                        className="text-md text-start font-semibold"
                                                    >
                                                        <h1 className="text-md text-start font-semibold">
                                                            {course.name}
                                                        </h1>
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-start p-3 w-[300px]">
                                    {selectedCourse?.name}
                                </p>
                            )}
                            <div className="mt-10 grid justify-items-center grid-cols-3 gap-4">
                                <div className="text-center mt-7 grid justify-items-center content-start">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>
                                            Souvik Deb
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-md font-bold mt-2">
                                        {students[1].userInfo.name}
                                    </p>
                                    <p className="text-4xl font-bold text-white">
                                        2
                                    </p>
                                </div>
                                <div className=" text-center grid justify-items-center content-start relative">
                                    <Crown
                                        color="gold"
                                        className="absolute -top-6 left-5 -rotate-12 "
                                    />
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>
                                            Souvik Deb
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-md font-bold mt-2">
                                        {students[0].userInfo.name}
                                    </p>
                                    <p className="text-8xl font-bold text-white">
                                        1
                                    </p>
                                </div>
                                <div className="text-center mt-7 grid justify-items-center content-start">
                                    <Avatar>
                                        <AvatarImage src="https://github.com/shadcn.png" />
                                        <AvatarFallback>
                                            Souvik Deb
                                        </AvatarFallback>
                                    </Avatar>
                                    <p className="text-md font-bold mt-2">
                                        {students[2].userInfo.name}
                                    </p>
                                    <p className="text-4xl font-bold text-white">
                                        3
                                    </p>
                                </div>
                            </div>
                            <div className="mt-12 text-center">
                                <div className="inline-flex justify-between items-center py-2 px-2 pr-4 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
                                    {/* <a
                                    href="/"
                                    className="inline-flex justify-between items-center py-2 px-2 pr-4 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                    role="alert"
                                    aria-label="Whatsapp us"
                                > */}
                                    <button>
                                        <span className="text-xs font-bold bg-secondary rounded-full text-white px-4 py-1.5 mr-3">
                                            {ownRank}
                                        </span>
                                    </button>
                                    <span className="text-sm font-medium  mr-2">
                                        Your rank
                                    </span>
                                    <ChevronUp color="#518672" />
                                    {/* </a> */}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
        </>
    )
}
