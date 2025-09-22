'use client'
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import moment from 'moment'
import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'
import { Button } from '@/components/ui/button'
import CurricullumCard from '@/app/admin/courses/[courseId]/_components/curricullumCard'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import NewModuleDialog from '@/app/admin/courses/[courseId]/_components/newModuleDialog'
import { Reorder, useDragControls } from 'framer-motion'
import { Spinner } from '@/components/ui/spinner'
import EditModuleDialog from '../../_components/EditModuleDialog'
import { X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import{CurriculumItem,ModuleData} from "@/app/admin/courses/[courseId]/(courseTabs)/curriculum/courseCurriculamType"
import { Plus } from 'lucide-react'


function Page() {
    const router = useRouter()
    const params = useParams()
    const courseId = params.courseId
    const [isCourseDeleted, setIsCourseDeleted] = useState(false)
    const [curriculum, setCurriculum] = useState<CurriculumItem[]>([])
    const [originalCurriculum, setOriginalCurriculum] = useState<
        CurriculumItem[]
    >([])
    const { courseData } = getCourseData()
    const [isLoading, setIsLoading] = useState(false)
    const [typeId, setTypeId] = useState(1)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [moduleId, setModuleId] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isReordering, setIsReordering] = useState(false)
    const [selectedModuleData, setSelectedModuleData] =
        useState<ModuleData | null>(null)
    const [pendingOrder, setPendingOrder] = useState<CurriculumItem[] | null>(
        null
    )
    const [reorderTimeout, setReorderTimeout] = useState<NodeJS.Timeout | null>(
        null
    )
    const [draggedModuleId, setDraggedModuleId] = useState<number | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [hasOrderChanged, setHasOrderChanged] = useState(false)
    
    // New states for border flash functionality
    const [flashingModuleId, setFlashingModuleId] = useState<number | null>(null)
    const [borderFlashTimeout, setBorderFlashTimeout] = useState<NodeJS.Timeout | null>(null)
    
    const [moduleData, setModuleData] = useState({
        name: '',
        description: '',
    })
    const [timeData, setTimeData] = useState({
        months: -1,
        weeks: -1,
        days: -1,
    })
    const dragControls = useDragControls()

    const containerRef = useRef<HTMLDivElement>(null)

    const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        setTypeId(value === 'learning-material' ? 1 : 2)
    }

    const handleModuleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setModuleData((prev) => ({ ...prev, [name]: value }))
    }

    const handleTimeAllotedChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target
        setTimeData((prev) => ({ ...prev, [name]: parseInt(value, 10) }))
    }

    useEffect(() => {
        if (moduleId && courseData?.id) {
            api.get(`/content/allModules/${courseData.id}`)
                .then((res) => {
                    const data = res.data.find(
                        (item:  ModuleData ) => moduleId === item.id
                    )
                    setSelectedModuleData(data)
                })
                .catch((error) => {
                    toast.error({
                        title: 'Error',
                        description: 'Failed to fetch module data',
                    })
                })
        }
    }, [moduleId, courseData?.id])

    const editHandle = (module: any) => {
        setEditMode(true)
        setModuleId(module)
        setIsEditOpen(true)
    }
    // Convert seconds to months, weeks and days:-
    const convertSeconds = (seconds: number) => {
        const SECONDS_IN_A_MINUTE = 60
        const SECONDS_IN_AN_HOUR = 60 * SECONDS_IN_A_MINUTE
        const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR
        const SECONDS_IN_A_WEEK = 7 * SECONDS_IN_A_DAY
        const SECONDS_IN_A_MONTH = 28 * SECONDS_IN_A_DAY
        const months = Math.floor(seconds / SECONDS_IN_A_MONTH)
        seconds %= SECONDS_IN_A_MONTH
        const weeks = Math.floor(seconds / SECONDS_IN_A_WEEK)
        seconds %= SECONDS_IN_A_WEEK
        const days = Math.floor(seconds / SECONDS_IN_A_DAY)
        seconds %= SECONDS_IN_A_DAY
        return {
            months: months,
            weeks: weeks,
            days: days,
        }
    }

    useEffect(() => {
        if (isOpen) {
            setModuleData({
                name: '',
                description: '',
            })
            setTimeData({
                months: -1,
                weeks: -1,
                days: -1,
            })

            setTypeId(1)
        }
    }, [isOpen])

    useEffect(() => {
        if (isEditOpen) {
            if (selectedModuleData) {
                setModuleData({
                    name: selectedModuleData.name || '',
                    description: selectedModuleData.description || '',
                })
                setTypeId(selectedModuleData.typeId)
                const result = convertSeconds(selectedModuleData.timeAlloted)
                setTimeData({
                    days: result.days,
                    weeks: result.weeks,
                    months: result.months,
                })
            }
        } else {
            setModuleData({
                name: '',
                description: '',
            })
            setTimeData({
                months: -1,
                weeks: -1,
                days: -1,
            })
        }
    }, [selectedModuleData])

    useEffect(() => {
        if (isEditOpen && moduleId && courseData?.id) {
            api.get(`/content/allModules/${courseData.id}`)
                .then((res) => {
                    const data = res.data.find(
                        (module: any) => module.id === moduleId
                    )
                    setSelectedModuleData(data) // Set the selected module's data
                    // Update the form fields when module data is fetched
                    setModuleData({
                        name: data?.name || '',
                        description: data?.description || '',
                    })
                    setTypeId(data?.typeId || 1)
                    // Convert seconds to time data and set it in state
                    const result = convertSeconds(data?.timeAlloted)
                    setTimeData({
                        days: result.days,
                        weeks: result.weeks,
                        months: result.months,
                    })
                })
                .catch((error) => {
                    toast.error({
                        title: 'Error',
                        description: 'Failed to fetch module data',
                    })
                })
        }
    }, [isEditOpen, moduleId, courseData?.id])

    const editModule = () => {
        if (!courseData?.id) {
            toast.error({
                title: 'Error',
                description: 'Course ID is missing',
            })
            return
        }

        const { days, weeks, months } = timeData
        const totalDays = days + weeks * 7 + months * 28
        const totalSeconds = totalDays * 86400
        const moduleDto = {
            ...moduleData,
            timeAlloted: totalSeconds,
            isLock: false,
        }

        if (totalSeconds === 0) {
            toast.error({
                title: 'Error',
                description: 'Please enter a valid duration',
            })
            return
        }

        api.put(
            `/content/editModuleOfBootcamp/${courseData.id}?moduleId=${moduleId}`,
            { moduleDto }
        )
            .then((res) => {
                if (res.data.message === 'Modified successfully') {
                    toast.success({
                        title: 'Success',
                        description: 'Module Edited Successfully',
                    })
                } else {
                    toast.error({
                        title: 'Error',
                        description: res.data[0].message,
                    })
                }
                fetchCourseModules()
                setIsEditOpen(false)
            })
            .catch(() => {
                toast.error({
                    title: 'Error',
                    description: 'Error updating module',
                })
            })
    }

    // Removed duplicate createModule function declaration

    const checkIfCourseExists = async () => {
        if (!courseId) return

        try {
            await api.get(`/bootcamp/${courseId}`)
            setIsCourseDeleted(false)
        } catch (error) {
            setIsCourseDeleted(true)
            getCourseData.setState({ courseData: null }) // Zustand clear
        }
    }

    // useEffect(() => {
    //     let interval: NodeJS.Timeout

    //     if (!isCourseDeleted) {
    //         interval = setInterval(() => {
    //             checkIfCourseExists()
    //         }, 500)
    //     }

    //     return () => clearInterval(interval)
    // }, [courseId, isCourseDeleted])

    const createModule = () => {
        if (!courseData?.id) {
            toast.error({
                title: 'Error',
                description: "'Course ID is missing'",
            })
            return
        }

        const { days, weeks, months } = timeData
        const totalDays = days + weeks * 7 + months * 28
        const totalSeconds = totalDays * 86400

        if (totalSeconds === 0) {
            toast.error({
                title: 'Error',
                description: "'Please enter a valid duration'",
            })
            return
        }

        api.post(`/content/modules/${courseData.id}?typeId=${typeId}`, {
            ...moduleData,
            timeAlloted: totalSeconds,
        })
            .then(() => {
                toast.success({
                    title: 'Success',
                    description: 'Module Created Successfully',
                })
                fetchCourseModules()
                setIsOpen(false)
                setIsLoading(false)
            })
            .catch(() => {
                setIsLoading(false)
                toast.error({
                    title: 'Error',
                    description: "'Error creating module'",
                })
            })
    }

    const fetchCourseModules = async () => {
        if (!courseData?.id) {
            toast.error({
                title: 'Error',
                description: 'Course ID is missing',
            })
            setLoading(false)
            return
        }

        try {
            const response = await api.get(
                `/content/allModules/${courseData.id}`
            )
            const modulesWithStartedFlag = response.data.map((module: ModuleData) => ({
                ...module,
                isStarted: false,
            }))
            setCurriculum(modulesWithStartedFlag)
            setOriginalCurriculum([...modulesWithStartedFlag])
            setLoading(false)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error?.response?.data.message === 'Bootcamp not found!') {
                    router.push(`/admin/courses`)
                    toast.info({
                        title: 'Caution',
                        description:
                            'The Course has been deleted by another Admin',
                    })
                } else {
                    toast.error({
                        title: 'Error',
                        description: 'Failed to fetch course Modules',
                    })
                }
            }
            setLoading(false)
        }
    }

    useEffect(() => {
        if (courseData?.id) {
            fetchCourseModules()
        }
    }, [courseData?.id])

    // New function to trigger border flash for specific module
    const triggerBorderFlash = (moduleId: number) => {
        setFlashingModuleId(moduleId)
        
        // Clear existing timeout if any
        if (borderFlashTimeout) {
            clearTimeout(borderFlashTimeout)
        }
        
        // Set new timeout to hide border flash
        const timeout = setTimeout(() => {
            setFlashingModuleId(null)
        }, 1500) // Flash duration - 600ms
        
        setBorderFlashTimeout(timeout)
    }

    async function handleReorder(newOrderModules: CurriculumItem[]) {
        if (!courseData?.id || !draggedModuleId) return

        // setIsReordering(true)

        const newPosition =
            newOrderModules.findIndex((item) => item.id === draggedModuleId) + 1

       
        // Check if order actually changed by comparing with original
        const originalPosition = originalCurriculum.findIndex(
            (item) => item.id === draggedModuleId
        ) + 1

        const hasActuallyChanged = originalPosition !== newPosition

         // If position hasn't changed, don't make API call
        if (!hasActuallyChanged) {
        setIsReordering(false)
        return // Early return - no API call, no toast
        }

    setIsReordering(true)

    const updatedModules = newOrderModules.map((item, index) => ({
        ...item,
        order: index + 1,
    }))
        try {
            const response = await api.put(
                `/Content/editModuleOfBootcamp/${courseData.id}?moduleId=${draggedModuleId}`,
                {
                    reOrderDto: { newOrder: newPosition },
                }
            )
            // setOriginalCurriculum([...updatedModules])
            const warningMsg = response.data?.[0]?.message ?? ''

            if (warningMsg.includes('started by')) {
                toast.warning({
                    title: 'Warning',
                    description: warningMsg,
                })

                const updatedOriginal = originalCurriculum.map((item) =>
                    item.id === draggedModuleId
                        ? { ...item, isStarted: true }
                        : item
                )
                setOriginalCurriculum(updatedOriginal)
                setCurriculum(updatedOriginal)
            } else {
                setOriginalCurriculum([...updatedModules])
                toast.success({
                    title: 'Success',
                    description: 'Module order updated successfully',
                })
                
                
                triggerBorderFlash(draggedModuleId)
            }

            setIsReordering(false)
        } catch (error) {
            // Revert to original order on error
            setCurriculum([...originalCurriculum])
            toast.error({
                title: 'Error',
                description: 'Error updating module order',
            })
            setIsReordering(false)
        }
    }

    const handleReorderModules = async (newOrderModules: CurriculumItem[]) => {
        // Update curriculum immediately for smooth UI
        const updatedModules = newOrderModules.map((item, index) => ({
            ...item,
            order: index + 1,
        }))
        setCurriculum(updatedModules)

        const oldOrder = originalCurriculum.map(item => item.id)
        const newOrder = updatedModules.map(item => item.id)

        const orderChanged = JSON.stringify(oldOrder) !== JSON.stringify(newOrder)
    
        if (orderChanged) {
        setHasOrderChanged(true)
        }
    
        
        // Clear any existing timeout
        if (reorderTimeout) {
            clearTimeout(reorderTimeout)
            setReorderTimeout(null)
        }

        if (!isDragging) {
            // Only set timeout if drag is not active (this means it's the final drop)
            const timeout = setTimeout(() => {
                if (hasOrderChanged) {
                    handleReorder(updatedModules)
                    setHasOrderChanged(false)
                }
            }, 200) // Reduced timeout since it's only for final drop

            setReorderTimeout(timeout)
        }
    }

    const handleDragStart = () => {
        setIsDragging(true)
        setHasOrderChanged(false)
    }

    const handleDragEnd = () => {
        setIsDragging(false)

        // After drag ends, check if we need to save
        setTimeout(() => {
            if (hasOrderChanged) {
                // handleReorder(curriculum)
                // setHasOrderChanged(false)

            const currentOrder = curriculum.map(item => item.id)
            const originalOrder = originalCurriculum.map(item => item.id)
            
            if (JSON.stringify(currentOrder) !== JSON.stringify(originalOrder)) {
                handleReorder(curriculum)
            }
            setHasOrderChanged(false)
            }
        }, 100)
    }

    // Add cleanup on unmount
    useEffect(() => {
        return () => {
            if (reorderTimeout) {
                clearTimeout(reorderTimeout)
            }
            if (borderFlashTimeout) {
                clearTimeout(borderFlashTimeout)
            }
        }
    }, [reorderTimeout, borderFlashTimeout])

    if (isCourseDeleted) {
        return (
            <div className="flex flex-col justify-center items-center h-full mt-20">
                <Image
                    src="\images\undraw_select-option_6wly.svg"
                    width={350}
                    height={350}
                    alt="Deleted"
                />
                <p className="text-lg text-red-600  mt-4">
                    This course has been deleted.
                </p>
                <Button
                    onClick={() => router.push('/admin/courses')}
                    className="mt-6 bg-secondary"
                >
                    Back to Courses
                </Button>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner className="text-secondary" />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="w-full flex flex-col items-center justify-center">
                <div className="w-full px-2 md:px-0 max-w-4xl flex flex-col gap-y-4 my-4">
                    <h2 className="text-xl font-semibold">
                        Course Curriculum
                    </h2>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="text-white bg-primary">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Module / Project
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <NewModuleDialog
                            moduleData={moduleData}
                            timeData={timeData}
                            createModule={createModule}
                            handleModuleChange={handleModuleChange}
                            handleTimeAllotedChange={handleTimeAllotedChange}
                            handleTypeChange={handleTypeChange}
                            typeId={typeId}
                            isOpen={isOpen}
                            setIsLoading={setIsLoading}
                            isLoading={isLoading}
                        />
                    </Dialog>
                </div>
            </div>

            {isEditOpen && (
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <EditModuleDialog
                        editMode={editMode}
                        moduleData={moduleData}
                        timeData={timeData}
                        createModule={createModule}
                        editModule={editModule}
                        handleModuleChange={handleModuleChange}
                        handleTimeAllotedChange={handleTimeAllotedChange}
                        typeId={typeId}
                    />
                </Dialog>
            )}

            {loading ? (
                <div className="my-5 flex justify-center items-center ">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-[rgb(81,134,114)]" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center overflow-hidden">
                    {curriculum.length > 0 ? (
                        <Reorder.Group
                            className="w-full px-2 md:px-0 max-w-4xl flex flex-col gap-y-4 my-4"
                            values={curriculum}
                            onReorder={handleReorderModules}
                            axis="y"
                            ref={containerRef}
                        >
                            {curriculum.map((item, index) => (
                                <CurricullumCard
                                    key={item.id}
                                    value={item}
                                    isStarted={item.isStarted}
                                    editHandle={editHandle}
                                    moduleId={item.id}
                                    courseId={courseData?.id ?? 0}
                                    order={item.order}
                                    name={item.name}
                                    description={item.description}
                                    index={index}
                                    quizCount={item.quizCount}
                                    assignmentCount={item.assignmentCount}
                                    timeAlloted={item.timeAlloted}
                                    codingProblemsCount={
                                        item.codingProblemsCount
                                    }
                                    articlesCount={item.articlesCount}
                                    typeId={item?.typeId}
                                    fetchCourseModules={fetchCourseModules}
                                    projectId={item.projectId}
                                    chapterId={item.ChapterId}
                                    setDraggedModuleId={setDraggedModuleId}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    showBorderFlash={flashingModuleId === item.id}
                                />
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="w-full flex flex-col gap-y-5 items-center justify-center">
                            <Image
                                src="/emptyStates/curriculum.svg"
                                alt="curriculum"
                                width={200}
                                height={200}
                            />
                            <p className="text-gray-600 text-lg">
                                Create new modules for the curriculum on Strapi
                                CMS
                            </p>
                            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                                <DialogTrigger asChild>
                                    <Button className="text-white bg-success-dark opacity-75">
                                        Add Module
                                    </Button>
                                </DialogTrigger>
                                <DialogOverlay />
                                <NewModuleDialog
                                    moduleData={moduleData}
                                    createModule={createModule}
                                    handleModuleChange={handleModuleChange}
                                    handleTimeAllotedChange={
                                        handleTimeAllotedChange
                                    }
                                    timeData={timeData}
                                    handleTypeChange={handleTypeChange}
                                    typeId={typeId}
                                    isOpen={isOpen}
                                    setIsLoading={setIsLoading}
                                    isLoading={isLoading}
                                />
                            </Dialog>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Page