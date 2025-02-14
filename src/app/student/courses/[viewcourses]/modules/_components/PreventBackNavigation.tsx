'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PreventBackNavigation = () => {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(window.location.pathname);

    const handlePopState = () => {
      // Push the user back to the current path
      router.push(currentPath);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, currentPath]);

  return null; // No UI rendering
};

export default PreventBackNavigation;
