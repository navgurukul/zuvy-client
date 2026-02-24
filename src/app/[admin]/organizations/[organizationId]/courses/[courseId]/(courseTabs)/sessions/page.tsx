'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import ClassCard from '../../_components/classCard'
import { api } from '@/utils/axios.config'
import { setStoreBatchValue } from '@/store/store'
import { getUser } from '@/store/store'
import RecordingCard from '../../_components/RecordingCard'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import ClassCardSkeleton from '../../_components/classCardSkeleton'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import { useRouter, useSearchParams, usePathname, useParams } from 'next/navigation'
import axios from 'axios'
import {
    State,
    ClassType,
    ParamsType,
    CourseClassItem,
} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/(courseTabs)/sessions/courseSessionType'
import { SearchBox } from '@/utils/searchBox'

function Page({ params }: ParamsType) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 
    const [classes, setClasses] = useState<CourseClassItem[]>([])
    const [students, setStudents] = useState<number>(0)
    const { setbatchValueData } = setStoreBatchValue()
    const position = useMemo(
        () => searchParams.get('limit') || POSITION,
        [searchParams]
    )
    const [bootcampData, setBootcampData] = useState<any>([])
    const [batchId, setBatchId] = useState<any>()
    const [activeTab, setActiveTab] = useState('upcoming')
    const [pages, setPages] = useState<number>()
    const [offset, setOffset] = useState<number>(OFFSET)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalStudents, setTotalStudents] = useState<number>(0)
    const [lastPage, setLastPage] = useState<number>(0)
    const [loading, setLoading] = useState(true)
    const [checkopenSessionForm, setOpenSessionForm] = useState(true)
    const [modulesData, setModulesData] = useState<any>([])
    const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('') // Track current search

    // Core API function that handles all data fetching
    const fetchClassesData = useCallback(
        async (offsetParam: number = offset, searchQuery: string = '') => {
            let url = `/classes/all/${params.courseId}?limit=${position}&offset=${offsetParam}`
            const lastUpdatedTab =
                localStorage.getItem('sessionTab') || activeTab

            url += `&status=${lastUpdatedTab}`
            if (batchId) url += `&batchId=${batchId}`
            if (searchQuery)
                url += `&searchTerm=${encodeURIComponent(searchQuery)}`

            try {
                const response = await api.get(url)
                setClasses(response.data.classes)
                setTotalStudents(response.data.total_items)
                setPages(response.data.total_pages)
                setLastPage(response.data.total_items)
                setLoading(false)
                return response.data
            } catch (error) {
                console.error('Error fetching classes:', error)
                setLoading(false)
                return null
            }
        },
        [params.courseId, batchId, position, activeTab, offset]
    )

    // Hook APIs
    const fetchSuggestionsApi = useCallback(
        async (query: string) => {
            if (!query.trim()) return []

            let url = `/classes/all/${params.courseId}?limit=10&offset=0`
            const lastUpdatedTab =
                localStorage.getItem('sessionTab') || activeTab
            url += `&status=${lastUpdatedTab}`

            if (batchId) url += `&batchId=${batchId}`
            if (query) url += `&searchTerm=${encodeURIComponent(query)}`

            try {
                const response = await api.get(url)
                return response.data.classes || []
            } catch (error) {
                console.error('Error fetching suggestions:', error)
                return []
            }
        },
        [params.courseId, batchId, activeTab]
    )

    const fetchSearchResultsApi = useCallback(
        async (query: string, offsetParam = offset) => {
            setCurrentSearchQuery(query) // Update current search query
            return await fetchClassesData(offsetParam, query)
        },
        [fetchClassesData, offset]
    )

    const defaultFetchApi = useCallback(
        async (offsetParam = offset) => {
            setCurrentSearchQuery('') // Clear current search query
            return await fetchClassesData(offsetParam, '')
        },
        [fetchClassesData, offset]
    )
    const handleComboboxChange = (value: string) => {
        setBatchId(value)
        setbatchValueData(value)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        localStorage.setItem('sessionTab', tab)
        setClasses([]) 

        fetchClassesData(0, currentSearchQuery)
        setOffset(0)
        setCurrentPage(1)
    }

    const tabs = ['completed', 'upcoming', 'ongoing']

    useEffect(() => {
        const lastUpdatedTab = localStorage.getItem('sessionTab')
        if (lastUpdatedTab) {
            setActiveTab(lastUpdatedTab)
        }
    }, [])

    // Initial data load - only call when component mounts
    useEffect(() => {
        const initialQuery = searchParams.get('search') || ''
        if (initialQuery) {
            setCurrentSearchQuery(initialQuery)
            fetchClassesData(offset, initialQuery)
        } else {
            fetchClassesData(offset, '')
        }
    }, []) // Only run on mount

    // Re-fetch when dependencies change (but respect current search state)
    useEffect(() => {
        if (params.courseId) {
            fetchClassesData(0, currentSearchQuery)
            setOffset(0)
            setCurrentPage(1)
        }
    }, [batchId, activeTab])

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await api.get(
                    `bootcamp/students/${params.courseId}`
                )
                setStudents(res.data.totalNumberOfStudents)
            } catch (error) {
                console.error(error)
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
                        fetchClassesData(offset, currentSearchQuery)
                    }, delay)
                    timeouts.push(timeout)
                } else {
                    console.error('Start time is in the past for', item.time)
                }
            })
        }

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [activeTab, classes, offset, fetchClassesData, currentSearchQuery])

    const getHandleAllBootcampBatches = useCallback(async () => {
        if (params.courseId) {
            try {
                const response = await api.get(
                    `/bootcamp/batches/${params.courseId}`
                )
                const transformedData = response.data.data.map(
                    (item: { id: number; name: string }) => ({
                        value: item.id.toString(),
                        label: item.name,
                    })
                )
                setBootcampData(transformedData)
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
    }, [params.courseId])

    const getAllModulesDetails = async () => {
        if (!params.courseId) return

        try {
            const response = await api.get(
                `/content/allModules/${params.courseId}`
            )
            setModulesData(response.data)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data.message === 'Bootcamp not found!') {
                    router.push(`/${userRole}/organizations/${orgId}/courses`)
                    toast.info({
                        title: 'Caution',
                        description:
                            'The Course has been deleted by another Admin',
                    })
                }
            }
            console.error('Failed to fetch modules data:', error)
        }
    }

    useEffect(() => {
        getHandleAllBootcampBatches()
        getAllModulesDetails()
    }, [getHandleAllBootcampBatches])

    const onClickHandler = () => {
        if (bootcampData.length === 0) {
            toast.info({
                title: 'Caution',
                description:
                    'There are no batches currently please create them and assign students to them first',
            })
            setOpenSessionForm(false)
        }

        if (students === 0) {
            toast.info({
                title: 'Caution',
                description:
                    'There are no batches currently please create them and assign students to them first',
            })
            setOpenSessionForm(false)
        }
    }

    // Updated pagination handler
    const getHandleAllClasses = useCallback(
        async (newOffset: number) => {
            setOffset(newOffset)
            await fetchClassesData(newOffset, currentSearchQuery)
        },
        [fetchClassesData, currentSearchQuery]
    )

    return (
        <>
            {loading ? (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="">
                    <div className="relative flex text-start gap-6 my-6 w-[200px]">
                        <Combobox
                            data={bootcampData}
                            title={'Batch'}
                            onChange={handleComboboxChange}
                            batch={false}
                            batchChangeData={{}}
                        />
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-center">
                        <div className="relative w-full lg:max-w-[500px]">
                            <SearchBox
                                placeholder="Search Classes"
                                fetchSuggestionsApi={fetchSuggestionsApi}
                                fetchSearchResultsApi={fetchSearchResultsApi}
                                defaultFetchApi={defaultFetchApi}
                                getSuggestionLabel={(s) => (
                                    <div>
                                        <div className="font-medium">
                                            {s.title}
                                        </div>
                                    </div>
                                )}
                                inputWidth="relative lg:w-[400px] w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-start gap-6 my-6">
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                className={`p-1 w-[100px] h-[30px] rounded-lg border border-input bg-background hover:border-green-700 hover:text-black ${
                                    activeTab === tab
                                        ? 'bg-success-dark opacity-75 text-white'
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
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    ) : (
                        <div>
                            {classes.length > 0 &&
                                (activeTab === classes[0]?.status ? (
                                    <>
                                        <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                                            {classes.map(
                                                (classData: any, index: any) =>
                                                    activeTab ===
                                                    classData.status ? (
                                                        activeTab ===
                                                        'completed' ? (
                                                            <div
                                                                key={
                                                                    classData.id ||
                                                                    index
                                                                }
                                                            >
                                                                <RecordingCard
                                                                    classData={
                                                                        classData
                                                                    }
                                                                    isAdmin
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={
                                                                    classData.id ||
                                                                    index
                                                                }
                                                            >
                                                                <ClassCard
                                                                    classData={
                                                                        classData
                                                                    }
                                                                    classType={
                                                                        activeTab
                                                                    }
                                                                    getClasses={
                                                                        getHandleAllClasses
                                                                    }
                                                                    activeTab={
                                                                        activeTab
                                                                    }
                                                                    studentSide={
                                                                        false
                                                                    }
                                                                />
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div key={classData}>
                                                            <ClassCardSkeleton />
                                                        </div>
                                                    )
                                            )}
                                        </div>
                                        <DataTablePagination
                                            totalStudents={totalStudents}
                                            lastPage={lastPage}
                                            pages={pages}
                                            fetchStudentData={
                                                getHandleAllClasses
                                            }
                                        />
                                    </>
                                ) : (
                                    <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                                        <ClassCardSkeleton />
                                    </div>
                                ))}
                            {classes.length === 0 && (
                                <div className="w- flex mb-10 items-center flex-col gap-y-3 justify-center text-center mt-2">
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
