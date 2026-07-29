'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudentDashboard from './_pages/StudentDashboard';
import { useTour } from './_components/guided-tour';
import { useOnboardingStorage } from '@/app/student/hooks/use-profile';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isTourCompleted, isOpen } = useTour();
  const { onboardingData, isLoading } = useOnboardingStorage();
  const stayOnDashboard = searchParams.get('stay') === 'dashboard';

  // Route guard: only redirect to profile if showTooltip was true (skipProfileSetup not set)
  useEffect(() => {
    if (isLoading) return;
    if (isOpen || isTourCompleted) return;
    if (stayOnDashboard) return;
    // showTooltip was false on login — user should stay on dashboard regardless of profile completion
    const skipProfileSetup = localStorage.getItem('skipProfileSetup');
    if (skipProfileSetup) return;
    if (onboardingData && !onboardingData.isCompleted) {
      router.push('/student/profile');
    }
  }, [onboardingData, isLoading, router, isOpen, isTourCompleted, stayOnDashboard]);

  // Prevent UI flash while redirecting
  if (isLoading || (!isOpen && !isTourCompleted && onboardingData && !onboardingData.isCompleted && !stayOnDashboard && !localStorage.getItem('skipProfileSetup'))) {
    return null;
  }

  return (
    <div>
      <StudentDashboard />
    </div>
  );
};

export default Page;
