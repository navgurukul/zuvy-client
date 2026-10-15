"use client";

import React, { useEffect, useState } from 'react'
import ModuleContentPage from '../../../../../../_pages/ModuleContentPage';
import { useParams } from 'next/navigation';
import { CareerToursBanner } from '@/app/careertours/signup/_components/CareerToursBanner';
import { CAREER_TOUR_BOOTCAMP_IDS } from '@/lib/utils';

const Page = () => {
    const params = useParams();
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [isStudentSignUp, setIsStudentSignUp] = useState(false);
    const isCareerTourBootcamp = CAREER_TOUR_BOOTCAMP_IDS.includes(Number(params.courseId));
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

  useEffect(() => {
    setIsFirstTimeLogin(localStorage.getItem('isFirstTImeLogin') === 'true');
    setIsStudentSignUp(localStorage.getItem('CAREER_TOURS_BANNER_STORAGE_KEY') === 'true');
  }, []);
    
  return (
    <div>
    {isCareerTourBootcamp &&
    (isFirstTimeLogin || isStudentSignUp) &&
    <CareerToursBanner />}
    
        <ModuleContentPage courseId={courseId} moduleId={moduleId} />
    </div>
  )
}

export default Page