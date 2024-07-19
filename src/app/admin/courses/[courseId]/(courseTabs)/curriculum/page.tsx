'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import moment from 'moment'

import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'
import { Button } from '@/components/ui/button'
import CurricullumCard from '@/app/admin/courses/[courseId]/_components/curricullumCard'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import NewModuleDialog from '@/app/admin/courses/[courseId]/_components/newModuleDialog'
import { Reorder } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import { Spinner } from '@/components/ui/spinner'

interface CurriculumItem {
    id: number
    name: string
    description: string
    order: number
    timeAlloted: number
    quizCount: number
    assignmentCount: number
    codingProblemsCount: number
    articlesCount: number
    typeId: number
    projectId: number
}
interface ModuleData {
    name: string
    description: string
    type: string
    timeAlloted: number
}

function Page() {
    // state and variables
    const [curriculum, setCurriculum] = useState([])
    const { courseData } = getCourseData()
    const [typeId, setTypeId] = useState(0)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [moduleId, setModuleId] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [selectedModuleData, setSelectedModuleData] =
        useState<ModuleData | null>(null)
    const [moduleData, setModuleData] = useState({
        name: '',
        description: '',
    })

    const [timeData, setTimeData] = useState({
        months: -1,
        weeks: -1,
        days: -1,
    })

    // func
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
        api.get(`/content/allModules/${courseData?.id}`).then((res) => {
            const data = res.data.find((item: any) => moduleId === item.id)
            setSelectedModuleData(data)
        })
    }, [moduleId])

    const editHandle = (module: any) => {
        setEditMode(true)
        setModuleId(module)
        setIsOpen(true)
    }

    const convertSeconds = (seconds: number) => {
        const SECONDS_IN_A_MINUTE = 60
        const SECONDS_IN_AN_HOUR = 60 * SECONDS_IN_A_MINUTE
        const SECONDS_IN_A_DAY = 24 * SECONDS_IN_AN_HOUR
        const SECONDS_IN_A_WEEK = 7 * SECONDS_IN_A_DAY
        const SECONDS_IN_A_MONTH = 30.44 * SECONDS_IN_A_DAY

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
        if (selectedModuleData) {
            setModuleData({
                name: selectedModuleData.name || '',
                description: selectedModuleData.description || '',
            })
            const result = convertSeconds(selectedModuleData.timeAlloted)
            setTimeData({
                days: result.days,
                weeks: result.weeks,
                months: result.months,
            })
        }
    }, [selectedModuleData])

    const editModule = () => {
        const { days, weeks, months } = timeData

        const totalSeconds = moment
            .duration({ days, weeks, months })
            .asSeconds()

        const moduleDto = {
            ...moduleData,
            timeAlloted: totalSeconds,
            isLock: false,
        }

        api.put(
            `/content/editModuleOfBootcamp/${courseData?.id}?moduleId=${moduleId}`,
            { moduleDto }
        )
            .then((res) => {
                toast({
                    title: 'Success',
                    description: 'Module Edited Successfully',
                    className: 'text-start capitalize border border-secondary',
                })
                fetchCourseModules()
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description: 'Error creating module',
                    className:
                        'text-start capitalize border border-destructive',
                })
            })
    }

    const createModule = () => {
        const { days, weeks, months } = timeData

        const totalSeconds = moment
            .duration({ days, weeks, months })
            .asSeconds()

        api.post(`/content/modules/${courseData?.id}?typeId=${typeId}`, {
            ...moduleData,
            timeAlloted: totalSeconds,
        })
            .then((res) => {
                toast({
                    title: 'Success',
                    description: 'Module Created Successfully',
                    className: 'text-start capitalize border border-secondary',
                })
                fetchCourseModules()
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description: 'Error creating module',
                    className:
                        'text-start capitalize border border-destructive',
                })
            })
    }

    const fetchCourseModules = async () => {
        try {
            const response = await api.get(
                `/content/allModules/${courseData?.id}`
            )
            setCurriculum(response.data)
            setLoading(false)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch course Modules',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    //   async
    useEffect(() => {
        if (courseData?.id) {
            fetchCourseModules()
        }
    }, [courseData?.id])

    async function handleReorder(newOrderModules: any) {
        newOrderModules = newOrderModules.map((item: any, index: any) => ({
            ...item,
            order: index + 1,
        }))
        let newOrder
        const oldOrder = curriculum.map((item: any) => item?.id)
        setCurriculum(newOrderModules)
        const movedItem = newOrderModules.find(
            (item: any, index: any) => item?.id !== oldOrder[index]
        )
        if (movedItem) {
            newOrder = newOrderModules.findIndex(
                (item: any) => item.id === movedItem.id
            )
        }
        try {
            const response = await api.put(
                `/Content/editModuleOfBootcamp/${courseData?.id}?moduleId=${movedItem.id}`,
                {
                    reOrderDto: { newOrder: newOrder + 1 },
                }
            )
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Error updating module order',
                className: 'text-start capitalize border border-destructive',
            })
        }
    }

    const handleReorderModules = async (newOrderModules: any) => {
        handleReorder(newOrderModules)
    }

    return (
        <div>
            {curriculum.length > 0 && (
                <div className="flex justify-end ">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="text-white bg-secondary">
                                Add Module
                            </Button>
                        </DialogTrigger>
                        <DialogOverlay />
                        <NewModuleDialog
                            editMode={editMode}
                            moduleData={moduleData}
                            timeData={timeData}
                            createModule={createModule}
                            editModule={editModule}
                            handleModuleChange={handleModuleChange}
                            handleTimeAllotedChange={handleTimeAllotedChange}
                            handleTypeChange={handleTypeChange}
                            typeId={typeId}
                            setTypeId={setTypeId}
                        />
                    </Dialog>
                </div>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <NewModuleDialog
                    editMode={editMode}
                    moduleData={moduleData}
                    timeData={timeData}
                    createModule={createModule}
                    editModule={editModule}
                    handleModuleChange={handleModuleChange}
                    handleTimeAllotedChange={handleTimeAllotedChange}
                    handleTypeChange={handleTypeChange}
                    typeId={typeId}
                    setTypeId={setTypeId}
                />
            </Dialog>
            {loading ? (
                <div className="my-5 flex justify-center items-center">
                    <div className="absolute h-screen">
                        <div className="relative top-[75%]">
                            <Spinner className="text-secondary" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center">
                    {curriculum.length > 0 ? (
                        <Reorder.Group
                            className="w-1/2"
                            values={curriculum}
                            onReorder={handleReorderModules}
                        >
                            {curriculum.map(
                                (item: CurriculumItem, index: number) => (
                                    <div key={item.id}>
                                        <Reorder.Item
                                            value={item}
                                            key={item.id}
                                        >
                                            <div
                                                className={`${
                                                    item.typeId === 2
                                                        ? 'bg-yellow/50'
                                                        : 'bg-muted'
                                                } my-3 p-3  flex rounded-xl`}
                                            >
                                                <CurricullumCard
                                                    editHandle={editHandle}
                                                    moduleId={item.id}
                                                    courseId={
                                                        courseData?.id ?? 0
                                                    }
                                                    order={item.order}
                                                    name={item.name}
                                                    description={
                                                        item.description
                                                    }
                                                    index={index}
                                                    quizCount={item.quizCount}
                                                    assignmentCount={
                                                        item.assignmentCount
                                                    }
                                                    timeAlloted={
                                                        item.timeAlloted
                                                    }
                                                    codingProblemsCount={
                                                        item.codingProblemsCount
                                                    }
                                                    articlesCount={
                                                        item.articlesCount
                                                    }
                                                    typeId={item?.typeId}
                                                    fetchCourseModules={
                                                        fetchCourseModules
                                                    }
                                                    projectId={item.projectId}
                                                />
                                            </div>
                                        </Reorder.Item>
                                    </div>
                                )
                            )}
                        </Reorder.Group>
                    ) : (
                        <div className=" w-full flex flex-col gap-y-5 items-center justify-center">
                            <Image
                                src="/emptyStates/curriculum.svg"
                                alt="curriculum"
                                width={200}
                                height={200}
                            />

                            <p>
                                Create new modules for the curriculum on Strapi
                                CMS
                            </p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white bg-secondary">
                                        Add Module
                                    </Button>
                                </DialogTrigger>
                                <DialogOverlay />
                                <NewModuleDialog
                                    editMode={editMode}
                                    moduleData={moduleData}
                                    createModule={createModule}
                                    editModule={editModule}
                                    handleModuleChange={handleModuleChange}
                                    handleTimeAllotedChange={
                                        handleTimeAllotedChange
                                    }
                                    timeData={timeData}
                                    handleTypeChange={handleTypeChange}
                                    typeId={typeId}
                                    setTypeId={setTypeId}
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
