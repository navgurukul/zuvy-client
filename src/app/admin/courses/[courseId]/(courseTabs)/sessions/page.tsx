'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import ClassCard from '../../_components/classCard'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import CreateSession from './CreateSession'
import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'
import RecordingCard from '@/app/student/courses/[viewcourses]/[recordings]/_components/RecordingCard'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'

type ClassType = 'active' | 'upcoming' | 'complete'

interface State {
    classType: ClassType
    position: typeof POSITION
    allClasses: any[]
    bootcampData: { value: string; label: string }[]
    batchId: number
    upcomingClasses: any[]
    pages: number
    offset: number
    currentPage: number
    totalStudents: number
    ongoingClasses: any[]
    completedClasses: any[]
    selectedDate: Date | null
    lastPage: number
    limit: number
}

function Page() {
    const [state, setState] = useState<State>({
        classType: 'upcoming',
        position: POSITION,
        allClasses: [],
        bootcampData: [],
        batchId: 0,
        upcomingClasses: [],
        pages: 0,
        offset: OFFSET,
        currentPage: 1,
        totalStudents: 0,
        ongoingClasses: [],
        completedClasses: [],
        selectedDate: null,
        lastPage: 0,
        limit: 6,
    })

    const { courseData } = getCourseData()

    const classTypes: { type: ClassType; label: string }[] = [
        { type: 'active', label: 'Active Classes' },
        { type: 'upcoming', label: 'Upcoming Classes' },
        { type: 'complete', label: 'Completed Classes' },
    ]

    const handleClassType = useCallback((type: ClassType) => {
        setState((prevState) => ({
            ...prevState,
            classType: type,
            offset: prevState.classType === type ? prevState.offset : 1,
        }))
    }, [])

    const handleComboboxChange = (value: string) => {
        setState((prevState) => ({
            ...prevState,
            batchId:
                prevState.batchId.toString() === value ? 0 : parseInt(value),
        }))
    }

    useEffect(() => {
        if (courseData?.id) {
            api.get(`/bootcamp/batches/${courseData?.id}`)
                .then((response) => {
                    const transformedData = response.data.data.map(
                        (item: { id: any; name: any }) => ({
                            value: item.id.toString(),
                            label: item.name,
                        })
                    )
                    setState((prevState) => ({
                        ...prevState,
                        bootcampData: transformedData,
                    }))
                })
                .catch((error) => {
                    console.log('Error fetching data:', error)
                })
        }
    }, [courseData])

    useEffect(() => {
        const { classType, ongoingClasses, completedClasses, upcomingClasses } =
            state
        const classes: Record<ClassType, any[]> = {
            active: ongoingClasses,
            complete: completedClasses,
            upcoming: upcomingClasses,
        }
        setState((prevState) => ({
            ...prevState,
            allClasses: classes[classType],
        }))
    }, [
        state.classType,
        state.ongoingClasses,
        state.completedClasses,
        state.upcomingClasses,
    ])

    useEffect(() => {
        const fetchClasses = async () => {
            const { batchId, offset, position, classType } = state
            const fetchId = batchId || courseData?.id
            const fetchUrl = batchId
                ? 'getClassesByBatchId'
                : 'getClassesByBootcampId'

            if (fetchId) {
                try {
                    const response = await api.get(
                        `/classes/${fetchUrl}/${fetchId}?offset=${offset}&limit=${position}`
                    )
                    setState((prevState) => ({
                        ...prevState,
                        upcomingClasses: response.data.upcomingClasses,
                        ongoingClasses: response.data.ongoingClasses,
                        completedClasses: response.data.completedClasses,
                    }))
                    handleClassType(classType)
                } catch (error) {
                    console.log('Error fetching classes:', error)
                }
            }
        }

        fetchClasses()
    }, [
        courseData,
        state.batchId,
        state.classType,
        state.offset,
        state.position,
        handleClassType,
    ])

    return (
        <>
            <div>
                <div className="relative flex text-start gap-6 my-6 max-w-[800px]">
                    <Combobox
                        data={state.bootcampData}
                        title={'Batch'}
                        onChange={handleComboboxChange}
                        batch={false}
                    />
                    <Combobox
                        data={[]}
                        title={'Module'}
                        onChange={() => {}}
                        isDisabled
                        batch={false}
                    />
                </div>
                <div className="flex justify-between">
                    <div className="w-[400px] pr-3">
                        <Input
                            type="text"
                            placeholder="Search Classes"
                            className="max-w-[500px]"
                            disabled
                        />
                    </div>
                    <CreateSession
                        courseId={courseData?.id || 0}
                        bootcampData={state.bootcampData}
                    />
                </div>
                <div className="flex justify-start gap-6 my-6">
                    {classTypes.map(({ type, label }) => (
                        <Badge
                            key={type}
                            variant={
                                state.classType === type
                                    ? 'secondary'
                                    : 'outline'
                            }
                            onClick={() => handleClassType(type)}
                            className="rounded-md cursor-pointer"
                        >
                            {label}
                        </Badge>
                    ))}
                </div>
                {state.allClasses && state.allClasses.length > 0 ? (
                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                        {state.allClasses.map((classData, index) =>
                            state.classType === 'complete' ? (
                                <RecordingCard
                                    classData={classData}
                                    key={index}
                                    isAdmin
                                />
                            ) : (
                                <ClassCard
                                    classData={classData}
                                    key={index}
                                    classType={state.classType}
                                />
                            )
                        )}
                    </div>
                ) : (
                    <div className="w-full flex mb-10 items-center flex-col gap-y-3 justify-center absolute text-center mt-2">
                        <Image
                            src={
                                '/emptyStates/undraw_online_learning_re_qw08.svg'
                            }
                            height={200}
                            width={200}
                            alt="batchEmpty State"
                        />
                        <p>
                            Create a session to start engagement with the
                            learners for course lessons or doubts
                        </p>
                        <CreateSession
                            courseId={courseData?.id || 0}
                            bootcampData={state.bootcampData}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default Page
