'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/hooks/use-profile';

export default function Page() {
  const { onboardingData, isLoading } = useOnboardingStorage();

  if (isLoading) {
    return null;
  }

  if (onboardingData?.isCompleted) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}

