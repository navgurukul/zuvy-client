'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { calculateProfileStrength, useOnboardingStorage } from '@/hooks/use-profile';

export default function Page() {
  const { onboardingData, isLoading } = useOnboardingStorage();

  if (isLoading) {
    return null;
  }

  const profileStrength = calculateProfileStrength(onboardingData);

  if (profileStrength > 20) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}

