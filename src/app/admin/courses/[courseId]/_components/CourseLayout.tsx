'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsList } from '@/components/ui/tabs'

import styles from '../../_components/cources.module.css'
import TabItem from './TabItem'
import { getCourseData } from '@/store/store'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useCourseDetails from '@/hooks/useCourseDetails' // Import the new hook
import {
    ArrowLeft,
    GraduationCap,
    Calendar,
    Info,
    BookOpen,
    Users,
    Settings,
    FileText,
    Upload,
    ExternalLink
} from 'lucide-react'

function CourseLayout() {
    const router = useRouter()
    const { courseId } = useParams()
    const { courseData, loading, error, fetchCourseDetails } = useCourseDetails()
    const [isModalOpen, setIsModalOpen] = useState(false)

    const courseMenu = [
        {
            title: 'General Details',
            value: 'generalDetails',
            href: `/admin/courses/${courseData?.id}/details`,
            icon: Info,
        },
        {
            title: 'Curriculum',
            value: 'curriculum',
            href: `/admin/courses/${courseData?.id}/curriculum`,
            icon: BookOpen,
        },
        {
            title: 'Students',
            value: 'students',
            href: `/admin/courses/${courseData?.id}/students`,
            icon: GraduationCap,
        },
        {
            title: 'Batches',
            value: 'batches',
            href: `/admin/courses/${courseData?.id}/batches`,
            icon: Users,
        },
        {
            title: 'Sessions',
            value: 'sessions',
            href: `/admin/courses/${courseData?.id}/sessions`,
            icon: Calendar,
        },
        {
            title: 'Submissions',
            value: 'submissions',
            href: `/admin/courses/${courseData?.id}/submissions`,
            icon: FileText,
        },
        {
            title: 'Settings',
            value: 'settings',
            href: `/admin/courses/${courseData?.id}/settings`,
            icon: Settings,
        },
    ]

    useEffect(() => {
        if (courseId) {
            const courseID = Array.isArray(courseId) ? courseId[0] : courseId
            fetchCourseDetails(parseInt(courseID))
        }
    }, [courseId, fetchCourseDetails])

    return (
        <>
            {/* <Breadcrumb crumbs={crumbs} /> */}
            <Link
                href={'/admin/courses'}
                className="flex space-x-2 w-[180px] text-foreground mt-8"
            >
                <ArrowLeft size={20} />
                <p className="ml-1 inline-flex text-sm font-medium md:ml-2">
                    Back to Course Library
                </p>
            </Link>
            <h1 className="font-heading text-start font-bold text-3xl text-foreground my-8">
                {courseData?.name}
            </h1>

            <div className="w-full">
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
                            <TabsList className="w-full bg-card border border-border items-center rounded-lg p-1 h-12 flex flex-nowrap justify-around overflow-x-auto">
                                {courseMenu.map(({ title, href, icon }) => (
                                <TabItem
                                    key={href}
                                    title={title}
                                    href={href}
                                    icon={icon}
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
                {/* <Tabs defaultValue="generalDetails" className="w-full">
                    <div className="relative border-b-2 border-muted">
                    <TabsList className="w-full bg-card border border-border items-center rounded-lg p-1 h-12 flex flex-nowrap justify-around overflow-x-auto">
                            {courseMenu.map(({ title, href, icon }) => (
                                <TabItem
                                    key={href}
                                    title={title}
                                    href={href}
                                    icon={icon}
                                />
                            ))}
                        </TabsList>
                    </div>
                </Tabs> */}
            </div>

        </>
    )
}

export default CourseLayout
