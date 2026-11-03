'use client';
import ProfilePage from '@/app/student/_pages/ProfilePage';
import EditProfilePage from '@/app/student/_pages/EditProfilePage';
import { useOnboardingStorage } from '@/app/student/hooks/use-profile';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTour } from '@/app/student/_components/guided-tour';
import { useLearnerProfileStrengthStore } from '@/store/learnerProfileStrengthStore';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { onboardingData, isLoading: isOnboardingLoading } = useOnboardingStorage();
  const forceEditMode = searchParams.get('mode') === 'edit';
  const { startTour, isTourCompleted, isOpen } = useTour();
  const [isClient, setIsClient] = useState(false);

  // API-driven profile completion percentage — the single source of truth for routing.
  // This survives cleared localStorage and accounts for students who skipped onboarding.
  const {
    strengthPercentage,
    loading: isStrengthLoading,
    fetched: isStrengthFetched,
    fetchStrength,
  } = useLearnerProfileStrengthStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch strength on mount if not already fetched
  useEffect(() => {
    if (isClient && !isStrengthFetched) {
      fetchStrength();
    }
  }, [isClient, isStrengthFetched, fetchStrength]);

  // Route guard: redirect to dashboard only if profile is complete and not in edit mode
  useEffect(() => {
    if (!isClient || isOnboardingLoading) return;
    if (isOpen) return; // don't redirect while tour is active
    if (onboardingData?.isCompleted && !forceEditMode) {
      router.push('/student');
    }
  }, [isClient, isOnboardingLoading, onboardingData, forceEditMode, router, isOpen]);

  // Start tour if isLoginFirst is set (showTooltip was true from login api)
  // useEffect(() => {
  //   if (!isClient || isOnboardingLoading) return;
  //   if (isTourCompleted) return;
  //   const isLoginFirst = localStorage.getItem('isLoginFirst');
  //   if (isLoginFirst) {
  //     localStorage.removeItem('isLoginFirst');
  //     startTour();
  //   }
  // }, [isClient, isOnboardingLoading, isTourCompleted, startTour]);

  // Wait for both localStorage and API strength to resolve before rendering
  const isLoading = isOnboardingLoading || isStrengthLoading || !isStrengthFetched;
  if (!isClient || isLoading) {
    return null;
  }

  // Prevent flashing while redirecting (bypass during active tour)
  if (!isOpen && onboardingData?.isCompleted && !forceEditMode) {
    return null;
  }

  // --- Percentage-based routing ---
  // profileCompletion === 0 from the API means the student has no saved profile data
  // on the server, regardless of localStorage state. Always send them through the
  // onboarding wizard so a profile record gets created before they can edit it.
  if (forceEditMode && strengthPercentage === 0) {
    return <ProfilePage />;
  }

  if (forceEditMode || onboardingData?.isCompleted) {
    return <EditProfilePage />;
  }

  return <ProfilePage />;
}
