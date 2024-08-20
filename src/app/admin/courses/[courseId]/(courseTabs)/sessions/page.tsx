'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import ClassCard from '../../_components/classCard'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import CreateSessionDialog from './CreateSession'
import { api } from '@/utils/axios.config'
import { getCourseData, setStoreBatchValue } from '@/store/store'
import RecordingCard from '@/app/student/courses/[viewcourses]/[recordings]/_components/RecordingCard'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import useDebounce from '@/hooks/useDebounce'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'

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

function Page({ params }: any) {
    const [classes, setClasses] = useState<any[]>([])
    const [students, setStudents] = useState<number>(0)
    const { setbatchValueData } = setStoreBatchValue()
    const [position, setPosition] = useState(POSITION)
    const [bootcampData, setBootcampData] = useState<any>([])
    const [batchId, setBatchId] = useState<any>()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const [search, setSearch] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [checkopenSessionForm, setOpenSessionForm] = useState(true)
    const debouncedSearch = useDebounce(search, 1000)

    const handleComboboxChange = (value: string) => {
        setBatchId(value)
        setbatchValueData(value)
    }
    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
    }
    const handleSetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const tabs = ['completed', 'upcoming', 'ongoing']

    const getHandleAllClasses = useCallback(
        async (offset: number) => {
            let baseUrl = `/classes/all/${params.courseId}?limit=${position}&offset=${offset}`

            if (batchId) {
                baseUrl += `&batchId=${batchId}`
            }

            baseUrl += `&status=${activeTab}`

            if (debouncedSearch) {
                baseUrl += `&searchTerm=${encodeURIComponent(debouncedSearch)}`
            }

            try {
                const res = await api.get(baseUrl)
                setClasses(res.data.classes)
                setTotalStudents(res.data.total_items)
                setPages(res.data.total_pages)
                setLastPage(res.data.total_items)
                setLoading(false)
            } catch (error) {
                console.error('Error fetching classes:', error)
            }
        },
        [batchId, activeTab, debouncedSearch, params.courseId, position]
    )

    const sortClasses = (classes: any) => {
        return classes.sort((a: any, b: any) => {
            const dateA = new Date(a.startTime)
            const dateB = new Date(b.startTime)

            if (dateA > dateB) return -1
            if (dateA < dateB) return 1

            // If dates are the same, compare times
            const timeA = dateA.getTime()
            const timeB = dateB.getTime()
            return timeB - timeA
        })
    }

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                await api
                    .get(`bootcamp/students/${params.courseId}`)
                    .then((res) => {
                        setStudents(res.data.totalNumberOfStudents)
                    })
            } catch (error) {
                console.log(error)
            }
        }

        fetchStudents()
    }, [params.courseId])
    useEffect(() => {
        let timeouts: NodeJS.Timeout[] = []

        if (activeTab === 'upcoming' && classes.length > 0) {
            const currentTimes = classes.map((cls) => ({
                date: new Date(cls.startTime),
                time: new Date(cls.startTime).toTimeString().split(' ')[0],
            }))

            currentTimes.forEach((item) => {
                const now = new Date()
                const delay = item.date.getTime() - now.getTime()

                if (delay > 0) {
                    const timeout = setTimeout(() => {
                        console.log('Class started at', item.time)
                        getHandleAllClasses(offset)
                    }, delay)
                    timeouts.push(timeout)
                } else {
                    console.log('Start time is in the past for', item.time)
                }
            })
        }

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [activeTab, offset, getHandleAllClasses])

    const getHandleAllBootcampBatches = useCallback(async () => {
        if (params.courseId) {
            await api
                .get(`/bootcamp/batches/${params.courseId}`)
                .then((response) => {
                    const transformedData = response.data.data.map(
                        (item: { id: any; name: any }) => ({
                            value: item.id.toString(),
                            label: item.name,
                        })
                    )
                    setBootcampData(transformedData)
                })
                .catch((error) => {
                    console.log('Error fetching data:', error)
                })
        }
    }, [params.courseId])

    useEffect(() => {
        getHandleAllClasses(offset)
    }, [getHandleAllClasses, offset])

    useEffect(() => {
        getHandleAllBootcampBatches()
    }, [getHandleAllBootcampBatches])

    const onClickHandler = () => {
        if (bootcampData.length === 0) {
            toast({
                title: 'Caution',
                description:
                    'There are no batches currently please create them and assign students to them first',
            })
            setOpenSessionForm(false)
        }

        if (students === 0) {
            toast({
                title: 'Caution',
                description:
                    'There are no batches currently please create them and assign students to them first',
            })
            setOpenSessionForm(false)
        }
    }

    return (
        <>
            {loading ? (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-secondary" />
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="relative flex text-start gap-6 my-6 w-[200px]">
                        <Combobox
                            data={bootcampData}
                            title={'Batch'}
                            onChange={handleComboboxChange}
                            batch={false}
                            batchChangeData={{}}
                        />
                    </div>
                    <div className="flex justify-between">
                        <div className="w-[400px] pr-3">
                            <Input
                                type="text"
                                placeholder="Search Classes"
                                className="max-w-[500px]"
                                value={search}
                                onChange={handleSetSearch}
                            />
                        </div>
                        {
                            <CreateSessionDialog
                                courseId={params?.courseId || 0}
                                bootcampData={bootcampData}
                                getClasses={getHandleAllClasses}
                                students={students}
                                checkopenSessionForm={checkopenSessionForm}
                                onClick={onClickHandler}
                            />
                        }
                    </div>
                    <div className="flex justify-start gap-6 my-6">
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                className={`p-1 w-[100px] h-[30px] rounded-lg ${
                                    activeTab === tab
                                        ? 'bg-secondary text-white'
                                        : 'bg-white'
                                }`}
                                onClick={() => handleTabChange(tab)}
                                variant={'outline'}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Button>
                        ))}
                    </div>
                    {loading ? (
                        <div className="flex justify-center">
                            <Spinner className="text-secondary" />
                        </div>
                    ) : (
                        <div>
                            {classes.length > 0 ? (
                                <>
                                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                                        {classes.map(
                                            (classData: any, index: any) =>
                                                activeTab === 'completed' ? (
                                                    <RecordingCard
                                                        classData={classData}
                                                        key={classData.id}
                                                        isAdmin
                                                    />
                                                ) : (
                                                    <ClassCard
                                                        classData={classData}
                                                        key={classData.id}
                                                        classType={activeTab}
                                                        getClasses={
                                                            getHandleAllClasses
                                                        }
                                                        activeTab={activeTab}
                                                        studentSide={false}
                                                    />
                                                )
                                        )}
                                    </div>
                                    <DataTablePagination
                                        totalStudents={totalStudents}
                                        position={position}
                                        setPosition={setPosition}
                                        pages={pages}
                                        lastPage={lastPage}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        fetchStudentData={getHandleAllClasses}
                                        setOffset={setOffset}
                                    />
                                </>
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
                                        Create a session to start engagement
                                        with the learners for course lessons or
                                        doubts
                                    </p>
                                    <CreateSessionDialog
                                        courseId={params.courseId || 0}
                                        bootcampData={bootcampData}
                                        getClasses={getHandleAllClasses}
                                        students={students}
                                        onClick={onClickHandler}
                                        checkopenSessionForm={
                                            checkopenSessionForm
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default Page
