"use client";

import React from 'react'
import ModuleContentPage from '../../../../_pages/ModuleContentPage';
import { useParams } from 'next/navigation';

const Page = () => {
    const params = useParams();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;
  return (
    <div>
        <ModuleContentPage courseId={courseId} moduleId={moduleId} />
    </div>
  )
}

export default Page