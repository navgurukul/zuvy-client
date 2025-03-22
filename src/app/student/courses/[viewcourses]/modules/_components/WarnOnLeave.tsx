'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const WarnOnLeave = () => {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (event:any) => {
      const warningMessage = 'This is a test. Please stay on the page until the test is complete.';
      event.preventDefault();
      event.returnValue = warningMessage;
      return warningMessage;
    };

    const handleRouteChange = (url:any) => {
      const confirmed = window.confirm('This is a test. Are you sure you want to leave?');
      if (!confirmed) {
        // Prevent navigation by pushing back to the current page
        router.push(window.location.pathname); // Keeps the user on the current page
        throw 'Navigation cancelled'; // Stops further route handling
      }
    };

    // Handle browser unload (refresh, tab close)
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Handle internal Next.js navigation
    const handlePopState = () => handleRouteChange(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  return null;
};

export default WarnOnLeave;
