'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/hooks/use-profile';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTour } from '@/app/student/_components/guided-tour';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { onboardingData, isLoading } = useOnboardingStorage();
  const forceEditMode = searchParams.get('mode') === 'edit';
  const { startTour, isTourCompleted, isOpen } = useTour();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Route guard: Redirect to dashboard if profile is complete (and not in force edit mode)
  useEffect(() => {
    if (!isClient || isLoading) return;
    if (isOpen) return; // Bypass route guard if guided tour is active
    if (onboardingData?.isCompleted && !forceEditMode) {
      router.push('/student');
    }
  }, [isClient, isLoading, onboardingData, forceEditMode, router, isOpen]);

  // Start guided tour if necessary and profile is incomplete
  useEffect(() => {
    if (!isClient || isLoading) return;
    if (onboardingData?.isCompleted && !forceEditMode) return;

    if (!isTourCompleted) {
      const isLoginFirst = localStorage.getItem('isLoginFirst');
      if (isLoginFirst) {
        localStorage.removeItem('isLoginFirst');
        startTour();
      }
    }
  }, [isClient, isLoading, isTourCompleted, startTour, onboardingData, forceEditMode]);

  if (isLoading) {
    return null;
  }

  // Prevent flashing profile page while redirecting complete profile to dashboard (bypass during tour)
  if (!isOpen && onboardingData?.isCompleted && !forceEditMode) {
    return null;
  }

  if (forceEditMode || onboardingData?.isCompleted) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}
