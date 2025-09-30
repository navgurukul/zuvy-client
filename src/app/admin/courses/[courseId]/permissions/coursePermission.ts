'use client';

import { coursePermissions } from '@/hooks/hookType';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


interface PermissionsComponentProps {
  permissions: coursePermissions;
}

const PermissionsComponent: React.FC<PermissionsComponentProps> = ({ permissions }) => {
  const router = useRouter();

  useEffect(() => {
    if (permissions) {
      const query = new URLSearchParams(
        Object.entries(permissions).reduce<Record<string, string>>((acc, [key, value]) => {
          acc[key] = String(value);
          return acc;
        }, {})
      ).toString();

      const currentPath = window.location.pathname;
      router.push(`${currentPath}?${query}`);
    }
  }, [permissions, router]);

  return null;
};

export default PermissionsComponent;
