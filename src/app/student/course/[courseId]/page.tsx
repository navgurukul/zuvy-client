'use client'
import React from 'react'
import CourseDashboardPage from '../../_pages/CourseDashboardPage'
import { useParams } from 'next/navigation';

type Props = {}

const Page = (props: Props) => {
    const params = useParams();
    const courseId = params.courseId as string;

  return (
    <div>
        <CourseDashboardPage courseId={courseId} />
    </div>
  )
}

export default Page