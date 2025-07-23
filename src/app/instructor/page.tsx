'use client'
import React, { useState } from 'react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import InstructorCard from './_components/instructorCard'
import RadioCheckbox from './_components/radioCheckbox'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { useLazyLoadedStudentData } from '@/store/store'
import Image from 'next/image'

const InstructorPage = () => {
    const { studentData } = useLazyLoadedStudentData()
    const [ongoingSessions, setOngoingSessions] = useState<any[]>([])
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
    const [allSessions, setAllSessions] = useState<any[]>([])
    const [position, setPosition] = useState(POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalSessions, setTotalSessions] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)

    const username: string[] | undefined = studentData?.name?.split(' ')
    const newUserName: string | undefined =
        username?.[0]?.charAt(0)?.toUpperCase() +
        (username?.[0]?.slice(1)?.toLowerCase() || '')

    const fetchSessions = (data: any) => {
        setAllSessions([...data.ongoing, ...data.upcoming])
        setOngoingSessions(data.ongoing)
        setUpcomingSessions(data.upcoming)
    }

    return (
        <MaxWidthWrapper className="">
            <div className="flex items-center justify-start">
                <Avatar>
                    <AvatarImage src={studentData?.profile_picture} />
                </Avatar>
                <p className="text-[30px] ml-4">
                    {`Hi, ${newUserName}! Here's Your Schedule`}
                </p>
            </div>
            <RadioCheckbox
                fetchSessions={fetchSessions}
                offset={offset}
                position={position}
                setTotalSessions={setTotalSessions}
                setPages={setPages}
                setLastPage={setLastPage}
            />
            <div className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-6">
                    {ongoingSessions.length > 0 &&
                        ongoingSessions.map((item) => {
                            return (
                                <InstructorCard
                                    key={item.id}
                                    batchName={item.bootcampName}
                                    topicTitle={item.title}
                                    startTime={item.startTime}
                                    endTime={item.endTime}
                                    typeClass={item.status}
                                    classLink={item.hangoutLink}
                                    status={item.status}
                                />
                            )
                        })}
                    {upcomingSessions.length > 0 &&
                        upcomingSessions.map((item) => {
                            return (
                                <InstructorCard
                                    key={item.id}
                                    batchName={item.bootcampName}
                                    topicTitle={item.title}
                                    startTime={item.startTime}
                                    endTime={item.endTime}
                                    typeClass={item.status}
                                    classLink={item.hangoutLink}
                                    status={item.status}
                                />
                            )
                        })}
                </div>
            </div>
            {allSessions.length < 1 && (
                <div className="flex flex-col items-start mt-7">
                    <div className="w-full flex flex-col items-center lg:flex-row lg:justify-between gap-8">
                        <div className="flex flex-col items-center mt-12 w-full">
                            <Image
                                src="/no-class.svg"
                                alt="No classes"
                                width={240}
                                height={240}
                            />
                            <p className="text-lg mt-3 text-center">
                                There are no classes scheduled
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {allSessions.length > 0 && (
                <DataTablePagination
                    totalStudents={totalSessions}
                    pages={pages}
                    lastPage={lastPage}
                    fetchStudentData={fetchSessions}                
                />
            )}
        </MaxWidthWrapper>
    )
}

export default InstructorPage
