'use client'

import React from 'react'
import { useRouter, useParams } from 'next/navigation'
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
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 

    return (
        <StudentDetailsView 
            courseId={params.courseId}
            studentId={params.studentId}
            onBack={() => {
                router.push(`/${userRole}/organizations/${orgId}/courses/${params.courseId}/students`)
            }}
        />
    )
}

export default StudentDetailPage