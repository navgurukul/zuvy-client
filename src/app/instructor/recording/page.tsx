'use client'

import React, { useState } from 'react'
import { OFFSET, POSITION } from '@/utils/constant'

import { Input } from '@/components/ui/input'
import RadioCheckbox from '../_components/radioCheckbox'
import InstructorCard from '../_components/instructorCard'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'

const Recordings = () => {
    const [classRecordings, setClassRecordings] = useState<any[]>([])
    const [position, setPosition] = useState(POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalSessions, setTotalSessions] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)

    const fetchSessions = (data: any) => {
        setClassRecordings(data)
    }

    return (
        <div>
            <h1 className="text-start text-lg font-semibold ">
                Class Recordings
            </h1>
            <Input
                type="search"
                placeholder="Search By Name"
                className="w-1/5"
            />
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
                    {classRecordings.map((item) => {
                        return (
                            <InstructorCard
                                key={item.id}
                                batchName={item.bootcampDetail.name}
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
        </div>
    )
}

export default Recordings
