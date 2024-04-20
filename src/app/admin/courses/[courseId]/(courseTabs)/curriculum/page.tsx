'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { api } from '@/utils/axios.config'
import { getCourseData } from '@/store/store'
import { Button } from '@/components/ui/button'
import CurricullumCard from '../../_components/curricullumCard'
import { Dialog, DialogOverlay, DialogTrigger } from '@/components/ui/dialog'
import NewModuleDialog from '../../_components/newModuleDialog'
import moment from 'moment'

function Page() {
    // state and variables
    const [curriculum, setCurriculum] = useState([])
    const { courseData } = getCourseData()

    const [moduleData, setModuleData] = useState({
        name: '',
        description: '',
    })

    const [timeData, setTimeData] = useState({
        months: 0,
        weeks: 0,
        days: 0,
    })

    // const [timeAlloted, setTimeAlloted] = useState('')

    // func

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

        api.post(`/content/modules/${courseData?.id}`, {
            ...moduleData,
            timeAlloted: totalSeconds,
        })
    }

    //   async
    useEffect(() => {
        if (courseData?.id) {
            const fetchCourseModules = async () => {
                try {
                    const response = await api.get(
                        `/content/allModules/${courseData?.id}`
                    )
                    const data = response.data
                    setCurriculum(data)
                } catch (error) {
                    console.error('Error fetching course details:', error)
                }
            }

            fetchCourseModules()
        }
    }, [courseData?.id])

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
                        />
                    </Dialog>
                </div>
            )}
            <div className="flex flex-col items-center justify-center">
                {curriculum.length > 0 ? (
                    curriculum.map(
                        (
                            {
                                name,
                                id,
                                description,
                                quizCount,
                                assignmentCount,
                                codingProblemsCount,
                                articlesCount,
                            },
                            index
                        ) => (
                            <div key={id} className="w-1/2  ">
                                <Link
                                    href={`/admin/courses/${courseData?.id}/module/${id}`}
                                    className="bg-gradient-to-bl my-3 p-3 from-blue-50 to-violet-50 flex rounded-xl  "
                                >
                                    <CurricullumCard
                                        name={name}
                                        description={description}
                                        index={index}
                                        quizCount={quizCount}
                                        assignmentCount={assignmentCount}
                                        codingProblemsCount={
                                            codingProblemsCount
                                        }
                                        articlesCount={articlesCount}
                                    />
                                </Link>
                            </div>
                        )
                    )
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
                            />
                        </Dialog>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page
