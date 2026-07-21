'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudentData } from '@/hooks/useStudentData';
import { useOnboardingStorage } from '@/hooks/use-profile';
import { api } from '@/utils/axios.config';

export interface TourStepConfig {
  id: string;
  targetSelector: string;
  title: string;
  content: string;
  route?: string;
  stepNumber: number;
  totalSteps: number;
}

interface TourContextType {
  isOpen: boolean;
  currentStepIndex: number;
  steps: TourStepConfig[];
  activeElementRect: DOMRect | null;
  isTourCompleted: boolean;
  startTour: (fromStepIndex?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
  resetTour: () => void;
}

// IDs of steps that require mentorship to be enabled for the course
const MENTORSHIP_STEP_IDS = new Set([
  'mentorship',
  'browse-mentors',
  'book-session',
  'my-sessions',
  'all-sessions',
  'upcoming-sessions',
  'completed-sessions',
]);

const MENTORSHIP_SUBSEQUENT_STEP_IDS = new Set([
  'book-session',
  'my-sessions',
  'all-sessions',
  'upcoming-sessions',
  'completed-sessions',
]);

const getTourSteps = (mentorshipEnabled: boolean): TourStepConfig[] => [
  {
    id: 'profile',
    targetSelector: '#tour-profile',
    title: 'Profile',
    content: 'Manage your profile information, update personal details, and access account settings from here.',
    route: '/student/profile',
    stepNumber: 1,
    totalSteps: 9,
  },
  {
    id: 'courses',
    targetSelector: '#tour-courses',
    title: 'Courses',
    content: 'View your enrolled courses and continue your learning journey from this section.',
    route: '/student',
    stepNumber: 2,
    totalSteps: 9,
  },
  {
    id: 'course-syllabus',
    targetSelector: '#tour-course-syllabus',
    title: 'Course Syllabus',
    content: mentorshipEnabled
      ? 'Browse all modules and chapters of your course here. Mentorship is enabled for this course — you can connect with mentors for personalised guidance.'
      : 'Browse all modules and chapters of your course here.',
    route: 'DYNAMIC_COURSE_SYLLABUS',
    stepNumber: 3,
    totalSteps: 9,
  },
  {
    id: 'mentorship',
    targetSelector: '#tour-mentorship',
    title: 'Mentorship',
    content: 'Connect with mentors and receive personalized guidance to accelerate your learning and career growth.',
    route: 'DYNAMIC_COURSE_SYLLABUS',
    stepNumber: 4,
    totalSteps: 9,
  },
  {
    id: 'browse-mentors',
    targetSelector: '#tour-browse-mentors',
    title: 'Browse Mentors',
    content: 'Explore available mentors, view their profiles, and book mentorship sessions based on your interests and goals.',
    route: 'DYNAMIC_MENTORS',
    stepNumber: 5,
    totalSteps: 9,
  },
  {
    id: 'book-session',
    targetSelector: '#tour-mentor-card',
    title: 'Book a Session',
    content: 'Click on any available mentor to view their available slots and book a mentorship session.',
    route: 'DYNAMIC_MENTORS',
    stepNumber: 6,
    totalSteps: 9,
  },
  {
    id: 'my-sessions',
    targetSelector: '#tour-my-sessions',
    title: 'My Sessions',
    content: 'Track all your mentorship sessions in one place.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 7,
    totalSteps: 9,
  },
  {
    id: 'all-sessions',
    targetSelector: '#tour-all-sessions',
    title: 'All Sessions',
    content: 'View all your sessions in one place — upcoming, in progress, completed, and cancelled.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 8,
    totalSteps: 9,
  },
  {
    id: 'upcoming-sessions',
    targetSelector: '#tour-upcoming-sessions',
    title: 'Upcoming Sessions',
    content: 'View all your upcoming booked mentorship sessions here.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 9,
    totalSteps: 9,
  },
  {
    id: 'completed-sessions',
    targetSelector: '#tour-completed-sessions',
    title: 'Completed Sessions',
    content: 'Review your completed mentorship sessions and learning history here.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 10,
    totalSteps: 10,
  },
];

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_COMPLETED_KEY = 'zuvy_dashboard_tour_completed';

export const TourProvider: React.FC<{ children: React.ReactNode; mentorshipEnabled?: boolean; hasAvailableMentors?: boolean }> = ({ children, mentorshipEnabled, hasAvailableMentors = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { studentData } = useStudentData();
  const { onboardingData } = useOnboardingStorage();

  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeElementRect, setActiveElementRect] = useState<DOMRect | null>(null);
  const [isTourCompleted, setIsTourCompleted] = useState(false);

  // Build steps from the factory so the course-syllabus step content is
  // dynamic (mentions mentorship when it is enabled).
  // Then filter out mentorship-only steps when mentorship is off.
  // Also filter out subsequent mentorship steps when no mentors are available.
  const steps = React.useMemo(() => {
    const allSteps = getTourSteps(Boolean(mentorshipEnabled));
    const filtered = allSteps.filter((step) => {
      if (!mentorshipEnabled && MENTORSHIP_STEP_IDS.has(step.id)) return false;
      if (mentorshipEnabled && !hasAvailableMentors && MENTORSHIP_SUBSEQUENT_STEP_IDS.has(step.id)) return false;
      return true;
    });
    return filtered.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
      totalSteps: filtered.length,
    }));
  }, [mentorshipEnabled, hasAvailableMentors]);

  // Check initial completion status from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
      setIsTourCompleted(completed === 'true');
    }
  }, []);

  const startTour = useCallback((fromStepIndex: number = 0) => {
    setCurrentStepIndex(fromStepIndex);
    setIsOpen(true);
  }, []);

  const skipTour = useCallback(async () => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      setIsTourCompleted(true);
    }
    // After skipping, redirect to profile page so the student can fill in their details
    router.push('/student/profile');
  }, [router]);

  const finishTour = useCallback(async () => {
    setIsOpen(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      setIsTourCompleted(true);
    }

    try {
      // Check actual backend profile strength to avoid stale localStorage data
      const res = await api.get('/learner-profile/strength');
      const isComplete =
        res.data?.isProfileComplete === true ||
        res.data?.data?.isProfileComplete === true ||
        res.data?.profileCompletion === 100;

      if (isComplete) {
        router.push('/student');
      } else {
        router.push('/student/profile');
      }
    } catch (err) {
      console.error('Error fetching profile strength during finishTour:', err);
      // Fallback to local storage
      let isCompleted = onboardingData?.isCompleted;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zuvy_onboarding_data');
        if (stored) {
          try {
            const parsedData = JSON.parse(stored);
            isCompleted = parsedData.isCompleted;
          } catch (e) { }
        }
      }

      if (isCompleted) {
        router.push('/student');
      } else {
        router.push('/student/profile');
      }
    }
  }, [onboardingData, router]);

  const resetTour = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOUR_COMPLETED_KEY);
      setIsTourCompleted(false);
    }
    startTour();
  }, [startTour]);

  // Resolves placeholder route tokens to actual route paths dynamically based on student enrollment
  const getActualRoute = useCallback((stepRoute: string | undefined) => {
    if (!stepRoute) return '';

    const activeBootcamp = studentData?.inProgressBootcamps?.[0];
    const bootcampId = activeBootcamp?.id;
    const orgId = activeBootcamp?.organizationId;

    if (stepRoute === 'DYNAMIC_COURSE_SYLLABUS') {
      return bootcampId && orgId
        ? `/student/course/${bootcampId}/org/${orgId}`
        : '/student';
    }
    if (stepRoute === 'DYNAMIC_MENTORS') {
      return bootcampId
        ? `/student/mentors?courseId=${bootcampId}`
        : '/student/mentors';
    }
    if (stepRoute === 'DYNAMIC_SESSIONS') {
      return bootcampId
        ? `/student/sessions?courseId=${bootcampId}`
        : '/student/sessions';
    }
    return stepRoute;
  }, [studentData]);

  // Stable ref so polling effect doesn't restart when studentData loads mid-tour
  const getActualRouteRef = useRef(getActualRoute);
  useEffect(() => {
    getActualRouteRef.current = getActualRoute;
  }, [getActualRoute]);

  const pendingStepRef = useRef<TourStepConfig | null>(null);

  const navigateToStepRoute = useCallback((step: TourStepConfig) => {
    const actualRoute = getActualRoute(step.route);
    const getPathOnly = (url: string) => url.split('?')[0];

    // If DYNAMIC route resolved to fallback '/student' but studentData not loaded yet,
    // store pending step and retry when studentData arrives
    const isDynamic = step.route?.startsWith('DYNAMIC_');
    const studentDataReady = !!studentData?.inProgressBootcamps;

    if (isDynamic && !studentDataReady) {
      pendingStepRef.current = step;
      return;
    }

    pendingStepRef.current = null;

    if (actualRoute && getPathOnly(pathname) !== getPathOnly(actualRoute)) {
      router.push(actualRoute);
    }
  }, [pathname, router, getActualRoute, studentData]);

  // Retry pending navigation once studentData is available
  useEffect(() => {
    if (!pendingStepRef.current) return;
    if (!studentData?.inProgressBootcamps) return;

    const step = pendingStepRef.current;
    pendingStepRef.current = null;

    const actualRoute = getActualRoute(step.route);
    const getPathOnly = (url: string) => url.split('?')[0];
    if (actualRoute && getPathOnly(pathname) !== getPathOnly(actualRoute)) {
      router.push(actualRoute);
    }
  }, [studentData, getActualRoute, pathname, router]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      // setActiveElementRect(null);
      setCurrentStepIndex(nextIndex);
      navigateToStepRoute(steps[nextIndex]);
    } else {
      finishTour();
    }
  }, [currentStepIndex, steps, navigateToStepRoute, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      // setActiveElementRect(null);
      setCurrentStepIndex(prevIndex);
      navigateToStepRoute(steps[prevIndex]);
    }
  }, [currentStepIndex, steps, navigateToStepRoute]);

  // Track target element size & position updates
  const updateActiveRect = useCallback(() => {
    if (!isOpen) return;

    const step = steps[currentStepIndex];
    if (!step) return;

    const element = document.querySelector(step.targetSelector);
    if (element) {
      setActiveElementRect(element.getBoundingClientRect());
    } else {
      setActiveElementRect(null);
    }
  }, [isOpen, currentStepIndex, steps]);

  // Handle polling for dynamic elements (especially during routing)
  useEffect(() => {
    if (!isOpen) {
      setActiveElementRect(null);
      return;
    }

    const step = steps[currentStepIndex];
    if (!step) return;

    // Use ref so studentData loading mid-tour doesn't restart polling
    const actualRoute = getActualRouteRef.current(step.route);
    const getPathOnly = (url: string) => url.split('?')[0];

    // If the target element is already present in the DOM (e.g. a header item that
    // exists across pages), set rect immediately so the tooltip does not vanish
    // during route transitions. Otherwise start polling and wait for the element
    // to appear on the destination page.
    const immediateElement = document.querySelector(step.targetSelector);
    if (immediateElement) {
      immediateElement.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
      requestAnimationFrame(() => {
        const el = document.querySelector(step.targetSelector);
        if (el) setActiveElementRect(el.getBoundingClientRect());
      });
      return;
    }

    // If element not present now and route doesn't match expected destination,
    // keep polling — don't hide the tooltip aggressively. This allows transitions
    // where header elements persist across pages to remain visible.
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(() => {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        clearInterval(interval);
        element.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'nearest' });
        requestAnimationFrame(() => {
          const el = document.querySelector(step.targetSelector);
          if (el) setActiveElementRect(el.getBoundingClientRect());
        });
      }
      else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.warn(`[Tour] target selector "${step.targetSelector}" not found after ${(maxAttempts * 100) / 1000
            }s.`);
          setActiveElementRect(null);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStepIndex, pathname, isOpen, steps]); // removed getActualRoute — using stable ref instead

  // Event listeners for window resize / scroll (with capturing) to update bounding rects
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updateActiveRect);
    window.addEventListener('scroll', updateActiveRect, { capture: true });

    return () => {
      window.removeEventListener('resize', updateActiveRect);
      window.removeEventListener('scroll', updateActiveRect, { capture: true });
    };
  }, [isOpen, updateActiveRect]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight') {
        // Prevent action on inputs
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, skipTour]);

  return (
    <TourContext.Provider
      value={{
        isOpen,
        currentStepIndex,
        steps,
        activeElementRect,
        isTourCompleted,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
        resetTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};