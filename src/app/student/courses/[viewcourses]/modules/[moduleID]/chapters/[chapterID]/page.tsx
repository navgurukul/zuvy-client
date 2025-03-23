'use client'
import React, { useEffect, useState } from 'react'
import ChapterContent from '../../../_components/ChapterContent'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

function Page({ params }: any) {
    const [moduleData, setModuleData] = useState([])
    const router = useRouter()
    useEffect(() => {
        const getModulesProgress = async () => {
            try {
                const res = await api.get(
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
        const moduleIds: any = moduleData.find(
            (mod: any) => mod.id.toString() === moduleId
        )
        if (module && moduleIds.isLock) {
            toast({
                title: 'Cannot go there Yet',
                description: 'Please complete all the modules to reach here',
                className:
                    'border border-red-500 text-red-500 text-left w-[90%]',
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