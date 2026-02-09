'use client'

import React from 'react'
import { useRouter,usePathname } from 'next/navigation'
import StudentDetailsView from '../(courseTabs)/students/components/StudentDetailsView'
import { getUser } from '@/store/store'

interface StudentDetailPageProps {
    params: {
        courseId: string
        studentId: string
    }
}

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ params }) => {
    const router = useRouter()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const pathname = usePathname()
    const orgName = pathname.split('/')[2]

    return (
        <StudentDetailsView 
            courseId={params.courseId}
            studentId={params.studentId}
            onBack={() => {
                router.push(`/${userRole}/${orgName}/courses/${params.courseId}/students`)
            }}
        />
    )
}

export default StudentDetailPage