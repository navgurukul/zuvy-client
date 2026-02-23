'use client'

import { useEffect, useState } from 'react'

import { Tabs, TabsList } from '@/components/ui/tabs'
import { getUser } from '@/store/store'
import styles from '../../_components/cources.module.css'
import TabItem from './TabItem'
import { getCourseData } from '@/store/store'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { toast } from '@/components/ui/use-toast'
import {
    ChevronLeft,
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
import {CourseLayoutSkeleton} from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminSkeleton'

function CourseLayout() {
    const router = useRouter()
    const { courseId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const { courseData, Permissions } = getCourseData()
    const pathname = usePathname()
    const role = pathname.split('/')[1]
    const orgName = pathname.split('/')[2]
    const [loading, setLoading] = useState(true)

    const courseMenu = [
        {
            title: 'General Details',
            value: 'generalDetails',
            href: `/${role}/${orgName}/courses/${courseData?.id}/details`,
            icon: Info,
        },
        {
            title: 'Curriculum',
            value: 'curriculum',
            href: `/${role}/${orgName}/courses/${courseData?.id}/curriculum`,
            icon: BookOpen,
        },
        {
            title: 'Students',
            value: 'students',
            href: `/${role}/${orgName}/courses/${courseData?.id}/students`,
            icon: GraduationCap,
        },
        {
            title: 'Batches',
            value: 'batches',
            href: `/${role}/${orgName}/courses/${courseData?.id}/batches`,
            icon: Users,
        },
        {
            title: 'Sessions',
            value: 'sessions',
            href: `/${role}/${orgName}/courses/${courseData?.id}/sessions`,
            icon: Calendar,
        },
        {
            title: 'Submissions',
            value: 'submissions',
            href: `/${role}/${orgName}/courses/${courseData?.id}/submissions`,
            icon: FileText,
        },
        {
            title: 'Settings',
            value: 'settings',
            href: `/${role}/${orgName}/courses/${courseData?.id}/settings`,
            icon: Settings,
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
                    router.push(`/${userRole}/${orgName}/courses`)
                    toast.info({
                        title: 'Caution',
                        description:
                            'The Course has been deleted by another Admin',
                    })
                }
                setLoading(false)
            } catch (error) {
                console.error('Caught in handleFetch', error)
            }
        }
    }

    useEffect(() => {
        handleFetch()
    }, [])

if (loading) {
  return <CourseLayoutSkeleton/>
}
    return (
        <div className="pl-6 pr-3">
            {/* <Breadcrumb crumbs={crumbs} /> */}
            <Link
                href={`/${role}/${orgName}/courses`}
                className="flex space-x-1 w-[180px] text-foreground mt-8 hover:text-primary"
            >
                <ChevronLeft size={20} />
                <p className="inline-flex text-sm font-medium md:ml-2 whitespace-nowrap">
                    Back to Course Studio
                </p>
            </Link>
            <h1 className="font-heading text-start font-bold text-3xl text-foreground my-8">
                {courseData?.name}
            </h1>

            <div className="w-full">
                <Tabs defaultValue="generalDetails" className="w-full">
                    <div
                        className="relative border-muted pr-1 flex justify-start overflow-x-auto overflow-y-hidden"
                        style={{
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE and Edge
                            flex: '0 0 auto'
                        }}
                    >
                        <TabsList className="w-full bg-card border border-border items-center rounded-lg p-1 h-12 flex flex-nowrap justify-around overflow-x-auto">
                            {courseMenu?.map(({ title, href, icon }) => {
                                // Check permissions based on tab title
                                const shouldRender = (() => {
                                    switch(title) {
                                        case 'General Details':
                                            return Permissions?.editCourse;
                                        case 'Curriculum':
                                            return Permissions?.viewModule;
                                        case 'Students':
                                            return Permissions?.viewStudent;
                                        case 'Batches':
                                            return Permissions?.viewBatch;
                                        case 'Submissions':
                                            return Permissions?.viewSubmission;
                                        case 'Settings':
                                            return Permissions?.viewSetting;
                                        default:
                                            return false;
                                    }
                                })();

                                // Only render the tab if user has permission
                                return shouldRender ? (
                                    <TabItem
                                        key={href}
                                        title={title}
                                        href={href}
                                        icon={icon}
                                    />
                                ) : null;
                            })}
                        </TabsList>
                        {/* <div
                            className="absolute top-0 right-0 h-full"
                            style={{
                                width: '20px', // Width of the gradient hint
                                background:
                                    'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)',
                                pointerEvents: 'none', // Ensure it doesn’t block clicks
                            }}
                        /> */}
                    </div>
                </Tabs>
            </div>

        </div>
    )
}

export default CourseLayout
