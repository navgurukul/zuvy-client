'use client'
import React, { useEffect, useState } from 'react'
import ChapterContent from '../../../_components/ChapterContent'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'
import {ModuleProgress,CourseParams}from '@/app/student/courses/[viewcourses]/modules/[moduleID]/chapters/[chapterID]/type'

// function Page({ params }:CourseParams ){
const Page: React.FC<{ params: CourseParams }> = ({ params }) => {
    const [moduleData, setModuleData] = useState<ModuleProgress[]>([])
    const router = useRouter()
    useEffect(() => {
        const getModulesProgress = async () => {
            try {
                const res = await api.get<ModuleProgress[]>(
                    `/tracking/allModulesForStudents/${params.viewcourses}`
                )
                setModuleData(res.data)
            } catch (error) {
                console.error('Error getting modules progress', error)
            }
        }
        getModulesProgress()
    }, [params.viewcourses])
    useEffect(() => {
        if (!moduleData.length) return
        const moduleId = params.moduleID
        const moduleIds: ModuleProgress | undefined  = moduleData.find(
            (mod: ModuleProgress
            ) => mod.id.toString() === moduleId
        )
        if (module && moduleIds?.isLock) {
            toast.error({
                title: 'Cannot go there Yet',
                description: 'Please complete all the modules to reach here',
            })
            router.push(`/student/courses`)
        }
    }, [ moduleData, router])

    return (
        <>
            <ChapterContent />
        </>
    )
}
export default Page