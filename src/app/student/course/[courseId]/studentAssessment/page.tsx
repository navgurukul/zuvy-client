'use client'
import React from 'react';
import AssessmentProvider from './_studentAssessmentComponents/AssessmentProvider';
import { useParams, useSearchParams } from 'next/navigation';

const StudentAssessmentPage = () => {
  const { courseId} = useParams();
  const searchParams = useSearchParams();
  const assessmentOutSourceId = searchParams.get('assessmentId');
  const moduleId = searchParams.get('moduleId');
  const chapterId = searchParams.get('chapterId');
  return (
    <AssessmentProvider params={{
    viewcourses: courseId as string,
    assessmentOutSourceId: assessmentOutSourceId as string,
    moduleID: moduleId as string,
    chapterId: chapterId as string,
  }} />
  )
};


export default StudentAssessmentPage;