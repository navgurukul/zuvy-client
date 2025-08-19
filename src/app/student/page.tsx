'use client';

import { useState, useEffect } from 'react';
import StudentDashboard from './_pages/StudentDashboard';
import FlashAnnouncementDialog from '../_components/FlashAnnouncement';


interface Props {
  // Add your props here
}

const Page = (props: Props) => {
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    // This runs only on the client side
    setIsClient(true);
    
    const isLoginFirst = localStorage.getItem('isLoginFirst');
    // Show announcement if isLoginFirst exists and has a truthy value
    setShowAnnouncement(!!isLoginFirst);
  }, []);

  // Don't render anything until we're on the client side
  if (!isClient) {
    return (
      <div>
        <StudentDashboard />
      </div>
    );
  }

  return (
    <div>
      {showAnnouncement && <FlashAnnouncementDialog />}
      <StudentDashboard />
    </div>
  );
};

export default Page;