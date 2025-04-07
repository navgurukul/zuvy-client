'use client'

import StudentNavbar from '@/app/_components/navbar'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname, useRouter } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import '../globals.css'
import { useEffect, useState } from 'react'
import { api } from '@/utils/axios.config'
import Notenrolled from '@/components/NotEnrolled'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get the current path
    const router = useRouter()
    const [isCourseEnrolled, setIsCourseEnrolled] = useState(false)

    const pathname = usePathname()
    const isAssessmentRoute =
        pathname?.includes('/student/courses') &&
        pathname?.includes('/modules') &&
        pathname?.includes('/assessment')
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])

    const isChapterRoute =
        /\/(chapters|viewresults|quizresults|codingresults|openendedresults|assessment)/.test(
            pathname
        )
    useEffect(() => {
        const link = window.location.href
        const match = link.match(/\/courses\/(\d+)\//)

        if (match) {
            const courseId = match[1]
            console.log(courseId) // Output: 508
            const fetchBootcampById = async () => {
                await api.get(`/student`).then((res) => {
                    const matchedData = res.data.some(
                        (bootcamp: any) => bootcamp.id == courseId
                    )
                    if (!matchedData) setIsCourseEnrolled(true)
                })
            }
            fetchBootcampById()
            // setTimeout(() => {
            //     window.location.reload()
            // }, 1000)
        }
    }, [])

    return (
        <div className="h-screen">
            {isCourseEnrolled ? (
                <Notenrolled />
            ) : user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-secondary" />
                </div>
            ) : user && user.rolesList.length !== 0 ? (
                <UnauthorizedUser rolesList={rolesList} path={'Student'} />
            ) : (
                <div className="h-screen">
                    <div>{!isAssessmentRoute && <StudentNavbar />}</div>
                    <div className={`${isChapterRoute ? 'px-2' : 'pt-20'}`}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}