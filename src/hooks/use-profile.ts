import { useCallback, useState, useEffect } from 'react';
import { CompetitiveProfile, OnboardingData } from '../lib/profile.types';

const ONBOARDING_STORAGE_KEY = 'zuvy_onboarding_data';
const FIRST_TIME_LOGIN_KEY = 'zuvy_first_time_login';

export const calculateProfileStrength = (onboardingData: OnboardingData | null): number => {
  if (!onboardingData) return 0;

  let strength = 0;

  if (onboardingData.step1) {
    strength += 20;
  }

  const hasSkills =
    (onboardingData.step2?.autoDetectedSkills?.length || 0) > 0 ||
    (onboardingData.step2?.additionalSkills?.length || 0) > 0;
  if (hasSkills) {
    strength += 20;
  }

  const hasProjects = (onboardingData.step2?.externalProjects?.length || 0) > 0;
  if (hasProjects) {
    strength += 20;
  }

  const hasEducationOrExperience =
    Boolean(onboardingData.step3?.academicPerformance) ||
    (onboardingData.step3?.workExperiences?.length || 0) > 0 ||
    (onboardingData.step3?.competitiveProfiles?.some(
      (profile: CompetitiveProfile) => Boolean(profile?.username)
    ) ?? false);
  if (hasEducationOrExperience) {
    strength += 20;
  }

  const hasCareerGoals =
    (onboardingData.step4?.targetRoles?.length || 0) > 0 ||
    onboardingData.step4?.locationPreferences?.remote ||
    (onboardingData.step4?.locationPreferences?.cities?.length || 0) > 0;
  if (hasCareerGoals) {
    strength += 20;
  }

  return Math.min(strength, 100);
};

/**
 * Hook to manage onboarding data in localStorage
 */
export const useOnboardingStorage = () => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const stored = localStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setOnboardingData(parsedData);
        } else {
          // Initialize empty onboarding data
          const initialData: OnboardingData = {
            currentStep: 1,
            isCompleted: false,
            hasSkipped: false,
            lastUpdated: new Date().toISOString(),
          };
          setOnboardingData(initialData);
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setOnboardingData({
          currentStep: 1,
          isCompleted: false,
          hasSkipped: false,
          lastUpdated: new Date().toISOString(),
        });
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save onboarding data to localStorage
  const saveOnboardingData = useCallback((data: OnboardingData) => {
    try {
      const updatedData = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
      setOnboardingData(updatedData);
      return true;
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      return false;
    }
  }, []);

  // Update specific step data
  const updateStepData = useCallback(
    (stepNumber: number, data: any) => {
      let updated = false;
      setOnboardingData((prev) => {
        if (!prev) {
          return prev;
        }

        const key = `step${stepNumber}` as keyof OnboardingData;
        const updatedData = {
          ...prev,
          [key]: data,
          lastUpdated: new Date().toISOString(),
        };

        try {
          localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
          updated = true;
        } catch (error) {
          console.error('Error saving onboarding data:', error);
        }

        return updatedData;
      });

      return updated;
    },
    []
  );

  // Move to next step
  const goToNextStep = useCallback(() => {
    let didUpdate = false;

    setOnboardingData((prev) => {
      if (!prev || prev.currentStep >= 4) {
        return prev;
      }

      const updatedData = {
        ...prev,
        currentStep: prev.currentStep + 1,
        lastUpdated: new Date().toISOString(),
      };

      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
        didUpdate = true;
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }

      return updatedData;
    });

    return didUpdate;
  }, []);

  // Move to previous step
  const goToPreviousStep = useCallback(() => {
    let didUpdate = false;

    setOnboardingData((prev) => {
      if (!prev || prev.currentStep <= 1) {
        return prev;
      }

      const updatedData = {
        ...prev,
        currentStep: prev.currentStep - 1,
        lastUpdated: new Date().toISOString(),
      };

      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
        didUpdate = true;
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }

      return updatedData;
    });

    return didUpdate;
  }, []);

  // Go to specific step
  const goToStep = useCallback((stepNumber: number) => {
    if (stepNumber < 1 || stepNumber > 4) return false;
    let didUpdate = false;

    setOnboardingData((prev) => {
      if (!prev) {
        return prev;
      }

      const updatedData = {
        ...prev,
        currentStep: stepNumber,
        lastUpdated: new Date().toISOString(),
      };

      try {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(updatedData));
        didUpdate = true;
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }

      return updatedData;
    });

    return didUpdate;
  }, []);

  // Mark onboarding as completed
  const completeOnboarding = useCallback(() => {
    if (!onboardingData) return false;

    const updatedData = {
      ...onboardingData,
      isCompleted: true,
      currentStep: 4,
      completedAt: new Date().toISOString(),
    };
    return saveOnboardingData(updatedData);
  }, [onboardingData, saveOnboardingData]);

  // Mark onboarding as skipped
  const skipOnboarding = useCallback(() => {
    if (!onboardingData) return false;

    const updatedData = {
      ...onboardingData,
      hasSkipped: true,
    };
    return saveOnboardingData(updatedData);
  }, [onboardingData, saveOnboardingData]);

  // Clear onboarding data (reset)
  const clearOnboardingData = useCallback(() => {
    try {
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      const initialData: OnboardingData = {
        currentStep: 1,
        isCompleted: false,
        hasSkipped: false,
        lastUpdated: new Date().toISOString(),
      };
      setOnboardingData(initialData);
      return true;
    } catch (error) {
      console.error('Error clearing onboarding data:', error);
      return false;
    }
  }, []);

  return {
    onboardingData,
    isLoading,
    saveOnboardingData,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    clearOnboardingData,
  };
};

/**
 * Hook to manage first-time login flag
 */
export const useFirstTimeLogin = () => {
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FIRST_TIME_LOGIN_KEY);
      setIsFirstTimeLogin(stored !== 'false');
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking first time login:', error);
      setIsLoading(false);
    }
  }, []);

  const markFirstLoginComplete = useCallback(() => {
    try {
      localStorage.setItem(FIRST_TIME_LOGIN_KEY, 'false');
      setIsFirstTimeLogin(false);
      return true;
    } catch (error) {
      console.error('Error marking first login complete:', error);
      return false;
    }
  }, []);

  const resetFirstTimeLogin = useCallback(() => {
    try {
      localStorage.removeItem(FIRST_TIME_LOGIN_KEY);
      setIsFirstTimeLogin(true);
      return true;
    } catch (error) {
      console.error('Error resetting first time login:', error);
      return false;
    }
  }, []);

  return {
    isFirstTimeLogin,
    isLoading,
    markFirstLoginComplete,
    resetFirstTimeLogin,
  };
};

/**
 * Hook for onboarding completion status
 */
export const useOnboardingStatus = () => {
  const { onboardingData } = useOnboardingStorage();

  return {
    isCompleted: onboardingData?.isCompleted || false,
    hasSkipped: onboardingData?.hasSkipped || false,
    currentStep: onboardingData?.currentStep || 1,
    progress: calculateProfileStrength(onboardingData),
  };
};
