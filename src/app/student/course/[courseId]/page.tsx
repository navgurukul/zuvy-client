'use client'
import React from 'react'
import CourseDashboardPage from '../../_pages/CourseDashboardPage'
import { useParams } from 'next/navigation';

const Page = () => {
    const params = useParams();
    const courseId = params.courseId as string;

  return (
    <div>
        <CourseDashboardPage courseId={courseId} />
    </div>
  )
}

export default Page