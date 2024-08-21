'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsList } from '@/components/ui/tabs'

import styles from '../../_components/cources.module.css'
import TabItem from './TabItem'
import { getCourseData } from '@/store/store'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function CourseLayout() {
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

    useEffect(() => {
        const storedCourseId = localStorage.getItem('courseId')
        if (storedCourseId) {
            // setCourseId(storedCourseId)
            getCourseData
                .getState()
                .fetchCourseDetails(parseInt(storedCourseId))
        }
    }, [])

    return (
        <>
            {/* <Breadcrumb crumbs={crumbs} /> */}
            <Link href={'/admin/courses'} className="flex space-x-2 w-[120px]">
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium text-gray-800 md:ml-2">
                    My Courses
                </p>
            </Link>
            <h1 className="text-3xl text-start font-bold my-6">
                {courseData?.name}
            </h1>
            <div className={styles.contentContainer}>
                <Tabs defaultValue="generalDetails" className="w-full">
                    <div className="text-start border-b-2 border-muted">
                        <TabsList className="rounded-none rounded-t-sm ">
                            {courseMenu.map(({ title, href }) => (
                                <TabItem key={href} title={title} href={href} />
                            ))}
                        </TabsList>
                    </div>
                </Tabs>
            </div>
        </>
    )
}

export default CourseLayout
