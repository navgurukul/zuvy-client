import { useCallback, useState, useEffect } from 'react';
import { OnboardingData } from '../lib/onboarding.types';

const ONBOARDING_STORAGE_KEY = 'zuvy_onboarding_data';
const FIRST_TIME_LOGIN_KEY = 'zuvy_first_time_login';

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
          // Add step4 mock data if it doesn't exist
          if (!parsedData.step4) {
            parsedData.step4 = {
              targetRoles: ['Frontend Developer', 'Full Stack Developer'],
              locationPreferences: {
                remote: true,
                cities: ['Bangalore', 'Hyderabad', 'Pune'],
              },
              salaryExpectations: {
                internship: '₹20–30k',
                fullTime: '₹7–10 LPA',
              },
              linkedinUrl: 'https://linkedin.com/in/alexjohnson',
              communicationPreferences: {
                email: true,
                whatsapp: true,
                phone: false,
              },
              allowCompaniesViewProfile: true,
              consentTimestamp: new Date().toISOString(),
            };
          }
          setOnboardingData(parsedData);
        } else {
          // Initialize empty onboarding data with mock step4
          const initialData: OnboardingData = {
            currentStep: 1,
            isCompleted: false,
            hasSkipped: false,
            lastUpdated: new Date().toISOString(),
            step4: {
              targetRoles: ['Frontend Developer', 'Full Stack Developer'],
              locationPreferences: {
                remote: true,
                cities: ['Bangalore', 'Hyderabad', 'Pune'],
              },
              salaryExpectations: {
                internship: '₹20–30k',
                fullTime: '₹7–10 LPA',
              },
              linkedinUrl: 'https://linkedin.com/in/alexjohnson',
              communicationPreferences: {
                email: true,
                whatsapp: true,
                phone: false,
              },
              allowCompaniesViewProfile: true,
              consentTimestamp: new Date().toISOString(),
            },
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
      if (!onboardingData) return false;

      const key = `step${stepNumber}` as keyof OnboardingData;
      const updatedData = {
        ...onboardingData,
        [key]: data,
      };
      return saveOnboardingData(updatedData);
    },
    [onboardingData, saveOnboardingData]
  );

  // Move to next step
  const goToNextStep = useCallback(() => {
    if (!onboardingData) return false;
    if (onboardingData.currentStep >= 4) return false;

    const updatedData = {
      ...onboardingData,
      currentStep: onboardingData.currentStep + 1,
    };
    return saveOnboardingData(updatedData);
  }, [onboardingData, saveOnboardingData]);

  // Move to previous step
  const goToPreviousStep = useCallback(() => {
    if (!onboardingData) return false;
    if (onboardingData.currentStep <= 1) return false;

    const updatedData = {
      ...onboardingData,
      currentStep: onboardingData.currentStep - 1,
    };
    return saveOnboardingData(updatedData);
  }, [onboardingData, saveOnboardingData]);

  // Go to specific step
  const goToStep = useCallback(
    (stepNumber: number) => {
      if (!onboardingData) return false;
      if (stepNumber < 1 || stepNumber > 4) return false;

      const updatedData = {
        ...onboardingData,
        currentStep: stepNumber,
      };
      return saveOnboardingData(updatedData);
    },
    [onboardingData, saveOnboardingData]
  );

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
    progress: onboardingData?.currentStep ? (onboardingData.currentStep / 4) * 100 : 0,
  };
};
