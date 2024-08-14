'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { OFFSET, POSITION } from '@/utils/constant'

import { Input } from '@/components/ui/input'
import RadioCheckbox from '../_components/radioCheckbox'
import InstructorCard from '../_components/instructorCard'

const Recordings = () => {
    const arr1 = [1, 2, 3, 4, 5]
    const [ongoingSessions, setOngoingSessions] = useState<any[]>([])
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
    const [position, setPosition] = useState(POSITION)
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalSessions, setTotalSessions] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)

    const fetchSessions = (data: any) => {
        setUpcomingSessions(data.ongoing)
        setUpcomingSessions(data.upcoming)
    }
    return (
        <div>
            <h1 className="text-start text-lg font-semibold ">
                1:1 Meeting Recordings
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
            {/* <RadioCheckbox />
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4'>
        {arr1.map((item) => {
          return (
            <InstructorCard
              key={item}
              batchName={"AFE + Navgurukul Basics"}
              date1={26}
              month={"Jan"}
              topicTitle={"1:1 Meet With Karan Singh"}
              classesTiming={"4:00 PM - 5:00 PM"}
              typeClass={"View"}
            />
          );
        })}
      </div> */}
        </div>
    )
}

export default Recordings
