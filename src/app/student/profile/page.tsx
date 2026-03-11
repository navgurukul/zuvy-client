'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/hooks/use-profile';

export default function Page() {
  const { onboardingData, isLoading } = useOnboardingStorage();

  if (isLoading) {
    return null;
  }

  const isProfileComplete = Boolean(onboardingData?.isCompleted);

  if (isProfileComplete) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}

