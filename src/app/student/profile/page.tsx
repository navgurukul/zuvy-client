'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/hooks/use-profile';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTour } from '@/app/student/_components/guided-tour';

export default function Page() {
  const searchParams = useSearchParams();
  const { onboardingData, isLoading } = useOnboardingStorage();
  const forceEditMode = searchParams.get('mode') === 'edit';
  const { startTour, isTourCompleted } = useTour();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!isTourCompleted) {
      startTour();
    }
  }, [isClient, isTourCompleted, startTour]);
  if (isLoading) {
    return null;
  }

  if (forceEditMode || onboardingData?.isCompleted) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}

