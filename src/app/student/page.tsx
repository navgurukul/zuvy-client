'use client';

import { useEffect } from 'react';
import StudentDashboard from './_pages/StudentDashboard';
// import ZoeFlashScreen from '../_components/ZoeFlashScreen';
import { useTour } from './_components/guided-tour';

const Page = () => {
  const { startTour, isTourCompleted } = useTour();

  useEffect(() => {
    if (isTourCompleted) return;
    const isLoginFirst = localStorage.getItem('isLoginFirst');
    if (!isLoginFirst) return;
    localStorage.removeItem('isLoginFirst');
    startTour(1);
  }, [isTourCompleted, startTour]);

  // const handleCloseAnnouncement = () => {
  //   localStorage.removeItem('isLoginFirst');
  //   if (!isTourCompleted) startTour(1);
  // };

  // const handleStartInterview = () => {
  //   localStorage.removeItem('isLoginFirst');
  //   if (!isTourCompleted) startTour(1);
  // };

  return (
    <div>
      {/* <ZoeFlashScreen
        isOpen={showAnnouncement}
        onClose={handleCloseAnnouncement}
        onStartInterview={handleStartInterview}
      /> */}
      <StudentDashboard />
    </div>
  );
};

export default Page;