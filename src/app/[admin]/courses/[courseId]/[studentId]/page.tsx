'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import StudentDetailsView from '../(courseTabs)/students/components/StudentDetailsView'

interface StudentDetailPageProps {
    params: {
        courseId: string
        studentId: string
    }
}

const StudentDetailPage: React.FC<StudentDetailPageProps> = ({ params }) => {
    const router = useRouter()

    return (
        <StudentDetailsView 
            courseId={params.courseId}
            studentId={params.studentId}
            onBack={() => {
                router.push(`/admin/courses/${params.courseId}/students`)
            }}
        />
    )
}

export default StudentDetailPage