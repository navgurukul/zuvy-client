'use client';

import { useState, useEffect } from 'react';
import StudentDashboard from './_pages/StudentDashboard';
// import FlashAnnouncementDialog from '../_components/FlashAnnouncement';



const Page = () => {
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    const isLoginFirst = localStorage.getItem('isLoginFirst');
    setShowAnnouncement(!!isLoginFirst);
  }, []);


  if (!isClient) {
    return (
      <div>
        <StudentDashboard />
      </div>
    );
  }

  return (
    <div>
      {/* {showAnnouncement && <FlashAnnouncementDialog />} */}
      <StudentDashboard />
    </div>
  );
};

export default Page;