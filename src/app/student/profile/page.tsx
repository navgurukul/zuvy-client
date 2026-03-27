'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/hooks/use-profile';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const { onboardingData, isLoading } = useOnboardingStorage();
  const forceEditMode = searchParams.get('mode') === 'edit';

  if (isLoading) {
    return null;
  }

  if (forceEditMode || onboardingData?.isCompleted) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}

