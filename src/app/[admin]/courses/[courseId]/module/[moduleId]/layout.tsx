'use client'

import Chapter from '@/components/ui/chapter'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import useResponsiveHeight from '@/hooks/useResponsiveHeight'
import { api } from '@/utils/axios.config'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getCurrentModuleName } from '@/store/store'
import { px } from 'framer-motion'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { courseId, moduleId, projectID } = useParams()
    const pathname = usePathname()
    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const heightClass = useResponsiveHeight()
    const [hasViewPermission, setHasViewPermission] = useState<boolean | null>(null)
    const [moduleName, setModuleName] = useState('')
    const moduleID = Array.isArray(moduleId) ? moduleId[0] : moduleId

    const checkPermissions = useCallback(async () => {
        if (!moduleID || projectID || adminAssessmentPreviewRoute) {
            setHasViewPermission(true)
            return
        }

        try {
            const response = await api.get(
                `/Content/allChaptersOfModule/${moduleID}`
            )
            const { moduleName: moduleTitle = '', permissions = {} } = response.data
            const canView = permissions?.viewChapter !== false
            setHasViewPermission(canView)
            setModuleName(moduleTitle)
        } catch (error) {
            console.error('Error checking permissions:', error)
            setHasViewPermission(true) // Default to showing content on error
        }
    }, [moduleID, projectID, adminAssessmentPreviewRoute])

    useEffect(() => {
        checkPermissions()
    }, [checkPermissions])

    // Show loading state while checking permissions
    if (hasViewPermission === null) {
        return (
            <div className="min-h-screen -mx-6 -md:mx-10 -my-5 p-5 flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    // Show empty state full-width when no view permission
    if (!hasViewPermission) {
        return (
            <div className="min-h-screen -mx-6 -md:mx-10 -my-5 p-5">
                <div className="flex h-screen flex-col bg-card">
                    <div className="px-6 pt-4">
                        <Link
                            href={`/admin/courses/${courseId}/curriculum`}
                            className="flex w-[180px] items-center space-x-2 text-foreground hover:text-primary"
                        >
                            <ArrowLeft size={20} />
                            <p className="text-sm font-medium">Back to Curriculum</p>
                        </Link>
                        {/* <div className="mt-6">
                            <h1 className="font-heading text-lg font-bold text-foreground">
                                Module Content
                            </h1>
                            <p className="font-heading text-sm font-bold text-muted-foreground">
                                {moduleName}
                            </p>
                        </div> */}
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-start gap-2 text-center pt-[8rem]">
                        <Image
                            src="/undraw_personal-site_z6pl.svg"
                            alt="No chapter permission"
                            width={100}
                            height={100}
                            priority
                            className="w-[30rem] h-[15rem] max-w-xs"
                        />
                        <h2 className="text-lg font-semibold text-foreground">
                            {"You don't have permission to view chapters"}
                        </h2>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            {"Contact admin to request access to this module's chapters."}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen -mx-6 -md:mx-10 -my-5 p-5">
            {projectID || adminAssessmentPreviewRoute ? (
                <div>{children}</div>
            ) : (
                <div className="flex w-full sticky top-0 h-3/5">
                    <div className='w-[22%] border-r border-gray-200'>
                        <Chapter /> 
                    </div>
                    <div className="w-[78%] pt-2">{children}</div>
                </div>
            )}
        </div>
    )
}
