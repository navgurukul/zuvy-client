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
}

function Page() {
    // state and variables
    const [curriculum, setCurriculum] = useState([])
    const { courseData } = getCourseData()
    const [typeId, setTypeId] = useState(0)

    const [moduleData, setModuleData] = useState({
        name: '',
        description: '',
    })

    const [timeData, setTimeData] = useState({
        months: 0,
        weeks: 0,
        days: 0,
    })

    // func
    const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target
        console.log(event.target)
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
                    className: 'text-start capitalize',
                })
                fetchCourseModules()
            })
            .catch((error) => {
                toast({
                    title: 'Error',
                    description: 'Error creating module',
                    className: 'text-start capitalize',
                })
            })
    }

    const fetchCourseModules = async () => {
        try {
            const response = await api.get(
                `/content/allModules/${courseData?.id}`
            )
            setCurriculum(response.data)
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch course Modules',
                className: 'text-start capitalize',
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
                className: 'text-start capitalize',
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
                            moduleData={moduleData}
                            timeData={timeData}
                            createModule={createModule}
                            handleModuleChange={handleModuleChange}
                            handleTimeAllotedChange={handleTimeAllotedChange}
                            handleTypeChange={handleTypeChange}
                            typeId={typeId}
                        />
                    </Dialog>
                </div>
            )}
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
                                    <Reorder.Item value={item} key={item.id}>
                                        <div className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  ">
                                            <CurricullumCard
                                                moduleId={item.id}
                                                courseId={courseData?.id ?? 0}
                                                order={item.order}
                                                name={item.name}
                                                description={item.description}
                                                index={index}
                                                quizCount={item.quizCount}
                                                assignmentCount={
                                                    item.assignmentCount
                                                }
                                                timeAlloted={item.timeAlloted}
                                                codingProblemsCount={
                                                    item.codingProblemsCount
                                                }
                                                articlesCount={
                                                    item.articlesCount
                                                }
                                                fetchCourseModules={
                                                    fetchCourseModules
                                                }
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
                            Create new modules for the curriculum on Strapi CMS
                        </p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="text-white bg-secondary">
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
                            />
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page
