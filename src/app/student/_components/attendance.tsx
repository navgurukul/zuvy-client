'use client'

// External imports
import { useEffect, useState, useCallback } from 'react'

// Internal imports
import { getAttendanceColorClass, cn } from '@/lib/utils'
import { api } from '@/utils/axios.config'
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


interface EnrolledCourse {
    id: number
    name: string
}

function Attendance() {
    const { studentData } = useLazyLoadedStudentData()
    const userID = studentData?.id && studentData?.id
    const [attendanceData, setAttendanceData] = useState<any[]>([])
    const [enrolledCourse, setEnrolledCourse] = useState([])
    const [selectedCourse, setSelectedCourse] =
        useState<EnrolledCourse | null>()

    const getAttendanceHandler = useCallback(async () => {
        await api.get(`/student/Dashboard/attendance`).then((res) => {
            const attendance = res.data.filter(
                (course: any) => selectedCourse?.id === course?.bootcampId
            )
            setAttendanceData(attendance)
        })
    }, [selectedCourse?.id])

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

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([getAttendanceHandler()])
        }

        fetchData()
    }, [getAttendanceHandler])

    return (
        <div>
            <div className="lg:w-[380px] flex flex-col flex-start mt-6">
                <div className="flex flex-row justify-between gap-8">
                    {enrolledCourse?.length > 0 && (
                        // <div
                        //     className={`${
                        //         upcomingClasses?.length > 0
                        //             ? 'w-1/2'
                        //             : 'w-[500px]'
                        //     } h-full px-3 py-4 bg-gray-100 rounded-lg items-center justify-center`}
                        // >
                        <div className="w-full h-full px-3 py-4 bg-gray-100 rounded-lg items-center justify-center ">
                            <h1 className=" text-xl text-start font-semibold px-3">
                                Attendance
                            </h1>
                            {enrolledCourse?.length > 1 ? (
                                <Select
                                    onValueChange={(e) => {
                                        handleCourseChange(e)
                                    }}
                                >
                                    <SelectTrigger className="w-full border-0 shadow-none focus:ring-0 focus:border-0 focus:outline-none bg-gray-100 mb-3 focus:!border-none focus:!outline-none">
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
                                                        {/* Font size not getting increased */}
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
                            <div className="gap-2 items-center px-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={cn(`w-[10px] h-[10px] rounded-full  ${getAttendanceColorClass(
                                            attendanceData[0]?.attendedClasses
                                        )}`)}
                                    />
                                    <h1>{attendanceData[0]?.attendedClasses}%</h1>
                                </div>
                                <div className="flex">
                                    <p className="text-md font-semibold">
                                        {' '}
                                        {
                                            attendanceData[0]?.attendance
                                        } of {attendanceData[0]?.totalClasses}{' '}
                                        Classes Attended
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Attendance
