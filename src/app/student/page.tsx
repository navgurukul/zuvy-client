'use client';

import { useState, useEffect } from 'react';
import StudentDashboard from './_pages/StudentDashboard';
import ZoeFlashScreen from '../_components/ZoeFlashScreen';

const Page = () => {
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const isLoginFirst = localStorage.getItem('isLoginFirst');
      setShowAnnouncement(!!isLoginFirst);
    }
    if (typeof window !== 'undefined') {
      const isLoginFirst = localStorage.getItem('isLoginFirst');
      setShowAnnouncement(!!isLoginFirst);
    }
  }, []);

  const handleCloseAnnouncement = () => {
    setShowAnnouncement(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoginFirst');
    }
  };

  const handleStartInterview = () => {
    setShowAnnouncement(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoginFirst');
    }
  };


  if (!isClient) {
    return (
      <div>
        <StudentDashboard />
      </div>
    );
  }

  return (
    <div>
      <ZoeFlashScreen 
        isOpen={showAnnouncement}
        onClose={handleCloseAnnouncement}
        onStartInterview={handleStartInterview}
      />
      <StudentDashboard />
    </div>
  );
};

export default Page;