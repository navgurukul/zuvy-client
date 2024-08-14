'use client'
import React, { useState, useEffect, useCallback } from 'react'

import { Avatar, AvatarImage } from '@/components/ui/avatar'
import InstructorCard from './_components/instructorCard'
import RadioCheckbox from './_components/radioCheckbox'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { useLazyLoadedStudentData } from '@/store/store'

const InstructorPage = () => {
    const { studentData } = useLazyLoadedStudentData()
    const [ongoingSessions, setOngoingSessions] = useState<any[]>([])
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
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
                    {ongoingSessions.map((item) => {
                        return (
                            <InstructorCard
                                key={item.batchId}
                                batchName={item.bootcampName}
                                topicTitle={item.title}
                                startTime={item.startTime}
                                endTime={item.endTime}
                                typeClass={item.status}
                                classLink={item.hangoutLink}
                            />
                        )
                    })}
                    {upcomingSessions.map((item) => {
                        return (
                            <InstructorCard
                                key={item.batchId}
                                batchName={item.bootcampName}
                                topicTitle={item.title}
                                startTime={item.startTime}
                                endTime={item.endTime}
                                typeClass={item.status}
                                classLink={item.hangoutLink}
                            />
                        )
                    })}
                </div>
            </div>
            <DataTablePagination
                totalStudents={totalSessions}
                position={position}
                setPosition={setPosition}
                pages={pages}
                lastPage={lastPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                fetchStudentData={fetchSessions}
                setOffset={setOffset}
            />
        </MaxWidthWrapper>
    )
}

export default InstructorPage
