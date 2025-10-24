'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
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
    return (
        <StudentDetailsView 
            courseId={params.courseId}
            studentId={params.studentId}
            onBack={() => {
                router.push(`/${userRole}/courses/${params.courseId}/students`)
            }}
        />
    )
}

export default StudentDetailPage