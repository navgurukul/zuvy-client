'use client'

import React, { useState } from 'react'
import { OFFSET, POSITION } from '@/utils/constant'
import useDebounce from '@/hooks/useDebounce'
import { Input } from '@/components/ui/input'
import RadioCheckbox from '../_components/radioCheckbox'
import InstructorCard from '../_components/instructorCard'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import Image from 'next/image'

const Recordings = () => {
    const [classRecordings, setClassRecordings] = useState<any[]>([])
    const [position, setPosition] = useState(POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalSessions, setTotalSessions] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const [search, setSearch] = useState('')
    const debouncedSearch = useDebounce(search, 1000)

    const fetchSessions = (data: any) => {
        setClassRecordings(data)
    }

    const handleSetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    return (
        <div className="lg:mx-12">
            <h1 className="text-start text-2xl font-semibold mb-8">
                Class Recordings
            </h1>
            <Input
                value={search}
                onChange={handleSetSearch}
                className="lg:w-1/5 w-full mb-3"
                placeholder="Search Class Recordings"
            />
            <RadioCheckbox
                fetchSessions={fetchSessions}
                offset={offset}
                position={position}
                setTotalSessions={setTotalSessions}
                setPages={setPages}
                setLastPage={setLastPage}
                debouncedSearch={debouncedSearch}
            />
            <div className="p-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-8 gap-y-6">
                    {classRecordings?.length > 0 &&
                        classRecordings.map((item) => {
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
            {(!classRecordings || classRecordings?.length === 0) && (
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
            {classRecordings?.length > 0 && (
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
            )}
        </div>
    )
}

export default Recordings
