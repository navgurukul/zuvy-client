'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsList } from '@/components/ui/tabs'

import styles from '../../_components/cources.module.css'
import TabItem from './TabItem'
import { getCourseData } from '@/store/store'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'

function CourseLayout() {
    const router = useRouter()
    const { courseId } = useParams()
    const { courseData } = getCourseData()
    // const [courseId, setCourseId] = useState<string>('')

    const courseMenu = [
        {
            title: 'General Details',
            value: 'generalDetails',
            href: `/admin/courses/${courseData?.id}/details`,
        },
        {
            title: 'Batches',
            value: 'batches',
            href: `/admin/courses/${courseData?.id}/batches`,
        },
        {
            title: 'Curriculum',
            value: 'curriculum',
            href: `/admin/courses/${courseData?.id}/curriculum`,
        },
        {
            title: 'Sessions',
            value: 'sessions',
            href: `/admin/courses/${courseData?.id}/sessions`,
        },
        {
            title: 'Settings',
            value: 'settings',
            href: `/admin/courses/${courseData?.id}/settings`,
        },
        {
            title: 'Students',
            value: 'students',
            href: `/admin/courses/${courseData?.id}/students`,
        },
        {
            title: 'Submissions',
            value: 'submissions',
            href: `/admin/courses/${courseData?.id}/submissions`,
        },
    ]

    const handleFetch = async () => {
        if (courseId) {
            try {
                const courseID = Array.isArray(courseId)
                    ? courseId[0]
                    : courseId
                const success = await getCourseData
                    .getState()
                    .fetchCourseDetails(parseInt(courseID))
                if (!success) {
                    router.push(`/admin/courses`)
                    toast.info({
                        title: 'Caution',
                        description:
                            'The Course has been deleted by another Admin',
                    })
                }
            } catch (error) {
                console.log('Caught in handleFetch', error)
            }
        }
    }

    useEffect(() => {
        const storedCourseId = localStorage.getItem('courseId')
        // if (courseId && storedCourseId) {
        //     // setCourseId(storedCourseId)
        //     getCourseData
        //         .getState()
        //         .fetchCourseDetails(parseInt(storedCourseId))
        // }
        // if (courseId) {
        //     const courseID = Array.isArray(courseId) ? courseId[0] : courseId
        //     getCourseData.getState().fetchCourseDetails(parseInt(courseID))
        // }
        handleFetch()
    }, [])

    return (
        <>
            {/* <Breadcrumb crumbs={crumbs} /> */}
            <Link
                href={'/admin/courses'}
                className="flex space-x-2 w-[120px] text-gray-800"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                    My Courses
                </p>
            </Link>
            <h1 className="text-3xl text-start font-bold my-6 text-gray-600">
                {courseData?.name}
            </h1>

            <div className="relative w-full">
                <Tabs defaultValue="generalDetails" className="w-full">
                    <div
                        className="relative border-b-2 border-muted flex justify-start overflow-x-auto overflow-y-hidden"
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE and Edge
                        }}
                    >
                        <div
                            className="flex w-max"
                            style={{
                                flex: '0 0 auto', // Prevent flex from shrinking or expanding
                            }}
                        >
                            <TabsList className="rounded-none rounded-t-sm flex-nowrap">
                                {courseMenu.map(({ title, href }) => (
                                    <TabItem
                                        key={href}
                                        title={title}
                                        href={href}
                                    />
                                ))}
                            </TabsList>
                        </div>
                        <div
                            className="absolute top-0 right-0 h-full"
                            style={{
                                width: '20px', // Width of the gradient hint
                                background:
                                    'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                pointerEvents: 'none', // Ensure it doesn’t block clicks
                            }}
                        />
                    </div>
                </Tabs>
            </div>
        </>
    )
}

export default CourseLayout
