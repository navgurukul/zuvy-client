'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStudentData } from '@/hooks/useStudentData';

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

const TOUR_STEPS: TourStepConfig[] = [
  {
    id: 'profile',
    targetSelector: '#tour-profile',
    title: 'Profile',
    content: 'Manage your profile information, update personal details, and access account settings from here.',
    route: '/student/profile',
    stepNumber: 1,
    totalSteps: 5,
  },
  {
    id: 'courses',
    targetSelector: '#tour-courses',
    title: 'Courses',
    content: 'View your enrolled courses and continue your learning journey from this section.',
    route: '/student',
    stepNumber: 2,
    totalSteps: 5,
  },
  {
    id: 'mentorship',
    targetSelector: '#tour-mentorship',
    title: 'Mentorship',
    content: 'Connect with mentors and receive personalized guidance to accelerate your learning and career growth.',
    route: 'DYNAMIC_COURSE_SYLLABUS',
    stepNumber: 3,
    totalSteps: 5,
  },
  {
    id: 'browse-mentors',
    targetSelector: '#tour-browse-mentors',
    title: 'Browse Mentors',
    content: 'Explore available mentors, view their profiles, and book mentorship sessions based on your interests and goals.',
    route: 'DYNAMIC_MENTORS',
    stepNumber: 4,
    totalSteps: 5,
  },
  {
    id: 'book-session',
    targetSelector: '#tour-mentor-card',
    title: 'Book a Session',
    content: 'Click on any available mentor to view their available slots and book a mentorship session.',
    route: 'DYNAMIC_MENTORS',
    stepNumber: 4,
    totalSteps: 5,
  },
  {
    id: 'my-sessions',
    targetSelector: '#tour-my-sessions',
    title: 'My Sessions',
    content: 'Track all your mentorship sessions in one place.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 5,
    totalSteps: 5,
  },
  {
    id: 'upcoming-sessions',
    targetSelector: '#tour-upcoming-sessions',
    title: 'Upcoming Sessions',
    content: 'View all your upcoming booked mentorship sessions here.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 5,
    totalSteps: 5,
  },
  {
    id: 'completed-sessions',
    targetSelector: '#tour-completed-sessions',
    title: 'Completed Sessions',
    content: 'Review your completed mentorship sessions and learning history here.',
    route: 'DYNAMIC_SESSIONS',
    stepNumber: 5,
    totalSteps: 5,
  },
];

const TourContext = createContext<TourContextType | undefined>(undefined);

const TOUR_COMPLETED_KEY = 'zuvy_dashboard_tour_completed';

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { studentData } = useStudentData();
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeElementRect, setActiveElementRect] = useState<DOMRect | null>(null);
  const [isTourCompleted, setIsTourCompleted] = useState(false);

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

  const skipTour = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      setIsTourCompleted(true);
    }
  }, []);

  const finishTour = useCallback(() => {
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
      setIsTourCompleted(true);
    }
  }, []);

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

  const navigateToStepRoute = useCallback((step: TourStepConfig) => {
    const actualRoute = getActualRoute(step.route);
    if (actualRoute) {
      const getPathOnly = (url: string) => url.split('?')[0];
      if (getPathOnly(pathname) !== getPathOnly(actualRoute)) {
        router.push(actualRoute);
      }
    }
  }, [pathname, router, getActualRoute]);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setActiveElementRect(null);
      setCurrentStepIndex(nextIndex);
      navigateToStepRoute(TOUR_STEPS[nextIndex]);
    } else {
      finishTour();
    }
  }, [currentStepIndex, navigateToStepRoute, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setActiveElementRect(null);
      setCurrentStepIndex(prevIndex);
      navigateToStepRoute(TOUR_STEPS[prevIndex]);
    }
  }, [currentStepIndex, navigateToStepRoute]);

  // Track target element size & position updates
  const updateActiveRect = useCallback(() => {
    if (!isOpen) return;
    
    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    const element = document.querySelector(step.targetSelector);
    if (element) {
      setActiveElementRect(element.getBoundingClientRect());
    } else {
      setActiveElementRect(null);
    }
  }, [isOpen, currentStepIndex]);

  // Handle polling for dynamic elements (especially during routing)
  useEffect(() => {
    if (!isOpen) {
      setActiveElementRect(null);
      return;
    }

    const step = TOUR_STEPS[currentStepIndex];
    if (!step) return;

    // Check if we are on the correct route first
    const actualRoute = getActualRoute(step.route);
    const getPathOnly = (url: string) => url.split('?')[0];
    if (actualRoute && getPathOnly(pathname) !== getPathOnly(actualRoute)) {
      setActiveElementRect(null); // Keep overlay solid during route transition
      return;
    }

    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max polling time

    const interval = setInterval(() => {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        clearInterval(interval);
        
        // Element found, record bounds
        setActiveElementRect(element.getBoundingClientRect());
        
        // Scroll target element to center smoothly if needed
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.warn(`[Tour] target selector "${step.targetSelector}" not found after 3s.`);
          setActiveElementRect(null); // Fallback to centered modal tooltip
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStepIndex, pathname, isOpen, getActualRoute]);

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
        steps: TOUR_STEPS,
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
