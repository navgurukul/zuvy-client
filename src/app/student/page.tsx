'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudentDashboard from './_pages/StudentDashboard';
// import ZoeFlashScreen from '../_components/ZoeFlashScreen';
import { useTour } from './_components/guided-tour';
import { useOnboardingStorage } from '@/hooks/use-profile';

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startTour, isTourCompleted, isOpen } = useTour();
  const { onboardingData, isLoading } = useOnboardingStorage();
  const stayOnDashboard = searchParams.get('stay') === 'dashboard';

  // Route guard: Redirect to profile page if profile is incomplete
  useEffect(() => {
    if (isLoading) return;
    if (isOpen || isTourCompleted) return; // Bypass if tour is active or was just completed/skipped
    if (onboardingData && !onboardingData.isCompleted && !stayOnDashboard) {
      router.push('/student/profile');
    }
  }, [onboardingData, isLoading, router, isOpen, isTourCompleted, stayOnDashboard]);

  // Start guided tour if necessary and profile is completed
  useEffect(() => {
    if (isLoading) return;
    if (onboardingData && !onboardingData.isCompleted) return;

    if (isTourCompleted) return;
    const isLoginFirst = localStorage.getItem('isLoginFirst');
    if (!isLoginFirst) return;
    localStorage.removeItem('isLoginFirst');
    startTour(1);
  }, [isTourCompleted, startTour, onboardingData, isLoading]);

  // Return null during loading or redirecting to prevent UI flash (bypass during tour)
  if (isLoading || (!isOpen && !isTourCompleted && onboardingData && !onboardingData.isCompleted && !stayOnDashboard)) {
    return null;
  }

  return (
    <div>
      {/* <ZoeFlashScreen
        isOpen={showAnnouncement}
        onClose={handleCloseAnnouncement}
        onStartInterview={handleStartInterview}
      /> */}
      <StudentDashboard />
    </div>
  );
};

export default Page;