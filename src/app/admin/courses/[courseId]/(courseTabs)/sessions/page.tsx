'use client'
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import ClassCard from '../../_components/classCard'
import { api } from '@/utils/axios.config'
import { setStoreBatchValue } from '@/store/store'
import RecordingCard from '../../_components/RecordingCard'
import { OFFSET, POSITION } from '@/utils/constant'
import { DataTablePagination } from '@/app/_components/datatable/data-table-pagination'
import useDebounce from '@/hooks/useDebounce'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/use-toast'
import ClassCardSkeleton from '../../_components/classCardSkeleton'
import { useCourseExistenceCheck } from '@/hooks/useCourseExistenceCheck'
import { useRouter, useSearchParams } from 'next/navigation'
import { X } from 'lucide-react'
import axios from 'axios'

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
    const router = useRouter()
    const searchParams = useSearchParams()
    // const [isCourseDeleted, setIsCourseDeleted] = useState(false)
    const [classes, setClasses] = useState<any[]>([])
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
    const [search, setSearch] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [checkopenSessionForm, setOpenSessionForm] = useState(true)
    const [modulesData, setModulesData] = useState<any>([])
    const debouncedSearch = useDebounce(search, 1000)
    // const { isCourseDeleted, loadingCourseCheck } = useCourseExistenceCheck(
    //     params.courseId
    // )

    //     const checkIfCourseExists = async () => {
    //     if (!params.courseId) return

    //     try {
    //       await api.get(`/bootcamp/${params.courseId}`)
    //       setIsCourseDeleted(false)
    //     } catch (error) {
    //       setIsCourseDeleted(true)
    //       getCourseData.setState({ courseData: null })
    //     }
    //   }

    //   useEffect(() => {
    //     let interval: NodeJS.Timeout

    //     if (!isCourseDeleted) {
    //       interval = setInterval(() => {
    //         checkIfCourseExists()
    //       }, 3000)
    //     }

    //     return () => clearInterval(interval)
    //   }, [params.courseId, isCourseDeleted])

    const [searchInitialized, setSearchInitialized] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isSuggestionClicked, setIsSuggestionClicked] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)
    const [allClassesData, setAllClassesData] = useState<any[]>([]) // Store all classes

    useEffect(() => {
        const searchFromURL = searchParams.get('search') || ''
        setSearch(searchFromURL)
        // If there's a search term in URL, treat it as if user selected it
        if (searchFromURL) {
            setIsSuggestionClicked(true)
        }
        setSearchInitialized(true)
    }, [searchParams])

    const handleComboboxChange = (value: string) => {
        setBatchId(value)
        setbatchValueData(value)
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        localStorage.setItem('sessionTab', tab)
    }

    const handleSetSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearch(value)
        setCurrentPage(1)
        setShowSuggestions(true)
        setSearchLoading(true)

        setIsSuggestionClicked(false) // Reset suggestion click state

        // Only update URL when user selects a suggestion or presses enter
        // Don't update URL on every keystroke
        if (value === '') {
            // Clear URL when search is empty
            const params = new URLSearchParams(window.location.search)
            params.delete('search')
            router.replace(`?${params.toString()}`)
        }
    }

    // Add this new function to handle when user presses Enter
    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value
            setIsSuggestionClicked(true)
            setShowSuggestions(false)

            const params = new URLSearchParams(window.location.search)
            if (value) {
                params.set('search', value)
            } else {
                params.delete('search')
            }
            router.replace(`?${params.toString()}`)
        }
    }

    const tabs = ['completed', 'upcoming', 'ongoing']

    useEffect(() => {
        const lastUpdatedTab = localStorage.getItem('sessionTab')
        if (lastUpdatedTab) {
            setActiveTab(lastUpdatedTab)
        }
    }, [])

    const getHandleAllClasses = useCallback(
        async (offset: number) => {
            let baseUrl = `/classes/all/${params.courseId}?limit=${position}&offset=${offset}`

            const lastUpdatedTab = localStorage.getItem('sessionTab')

            if (batchId) {
                baseUrl += `&batchId=${batchId}`
            }

            baseUrl += `&status=${lastUpdatedTab || activeTab}`

            try {
                const res = await api.get(baseUrl)
                let allClasses = res.data.classes

                // Store all classes data
                setAllClassesData(allClasses)

                let filteredClasses = allClasses

                // Filter classes based on search term - fix the logic here
                if (
                    debouncedSearch &&
                    (isSuggestionClicked || searchParams.get('search'))
                ) {
                    filteredClasses = allClasses.filter((cls: any) =>
                        cls?.title
                            ?.toLowerCase()
                            .includes(debouncedSearch.toLowerCase())
                    )
                }

                // Only show classes if they match the active tab status
                if (
                    allClasses.length > 0 &&
                    activeTab === allClasses[0]?.status
                ) {
                    setClasses(filteredClasses)
                } else {
                    setClasses([])
                }

                setTotalStudents(res.data.total_items)
                setPages(res.data.total_pages)
                setLastPage(res.data.total_items)
                setLoading(false)
                setSearchLoading(false)
            } catch (error) {
                console.error('Error fetching classes:', error)
                setLoading(false)
                setSearchLoading(false)
            }
        },
        [
            batchId,
            activeTab,
            debouncedSearch,
            params.courseId,
            position,
            isSuggestionClicked,
            searchParams,
        ]
    )

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                await api
                    .get(`bootcamp/students/${params.courseId}`)
                    .then((res) => {
                        setStudents(res.data.totalNumberOfStudents)
                    })
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
                        getHandleAllClasses(offset)
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
                    console.error('Error fetching data:', error)
                })
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
                    router.push(`/admin/courses`)
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
        if (searchInitialized) {
            getHandleAllClasses(offset)
        }
    }, [getHandleAllClasses, offset, searchInitialized])

    const handleSuggestionClick = (title: string) => {
        setSearch(title)
        setShowSuggestions(false)
        setIsSuggestionClicked(true)
        setCurrentPage(1)
        setSearchLoading(false)

        const params = new URLSearchParams(window.location.search)
        params.set('search', title)
        router.replace(`?${params.toString()}`)
    }

    // Generate suggestions from all classes data, not just filtered classes
    useEffect(() => {
        if (search.trim() !== '' && allClassesData.length > 0) {
            const filtered = allClassesData
                .filter((cls) =>
                    cls?.title?.toLowerCase().includes(search.toLowerCase())
                )
                .slice(0, 5)
            setSuggestions(filtered)
        } else {
            setSuggestions([])
        }
    }, [search, allClassesData])

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

    // if (loadingCourseCheck) {
    //     return (
    //         <div className="flex justify-center items-center h-full mt-20">
    //             <Spinner className="text-secondary" />
    //         </div>
    //     )
    // }

    // if (isCourseDeleted) {
    //     return (
    //         <div className="flex flex-col justify-center items-center h-full mt-20">
    //             <Image
    //                 src="/images/undraw_select-option_6wly.svg"
    //                 width={350}
    //                 height={350}
    //                 alt="Deleted"
    //             />
    //             <p className="text-lg text-red-600 mt-4">
    //                 This course has been deleted !
    //             </p>
    //             <Button
    //                 onClick={() => router.push('/admin/courses')}
    //                 className="mt-6 bg-secondary"
    //             >
    //                 Back to Courses
    //             </Button>
    //         </div>
    //     )
    // }

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
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search Classes"
                                    value={search}
                                    onChange={handleSetSearch}
                                    className="pr-10"
                                    onFocus={() => {
                                        if (search) setShowSuggestions(true)
                                    }}
                                    onKeyDown={handleSearchSubmit}
                                />
                                {search && (
                                    <Button
                                        onClick={() => {
                                            setSearch('')
                                            setOffset(0)
                                            setCurrentPage(1)
                                            setSuggestions([])
                                            setShowSuggestions(false)
                                            setIsSuggestionClicked(false)

                                            const params = new URLSearchParams(
                                                window.location.search
                                            )
                                            params.delete('search')
                                            router.replace(
                                                `?${params.toString()}`
                                            )
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {/* Suggestions */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute z-50 bg-white border border-gray-200 mt-1 rounded-md w-full max-w-[500px] shadow-md">
                                    {suggestions.map((item, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() =>
                                                handleSuggestionClick(
                                                    item.title
                                                )
                                            }
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
                                        >
                                            {item.title}
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                (activeTab === classes[0].status ? (
                                    <>
                                        <div className="grid lg:grid-cols-3 grid-cols-1 gap-6">
                                            {classes.map(
                                                (classData: any, index: any) =>
                                                    activeTab ===
                                                    classData.status ? (
                                                        activeTab ===
                                                        'completed' ? (
                                                            <div
                                                                key={classData}
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
                                                                key={classData}
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
