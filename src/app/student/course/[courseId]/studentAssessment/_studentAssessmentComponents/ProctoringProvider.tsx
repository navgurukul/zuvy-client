'use client';

import React, { useEffect, useRef } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { isFullScreen } from './utils/fullscreenUtils';

interface ProctoringProviderProps {
  children: React.ReactNode;
  assessmentData: any;
  assessmentSubmitId: number | null;
  onSubmit: () => void;
  setIsFullScreen: (value: boolean) => void;
}

// Proctoring data storage
let proctoringData = {
  tabChange: 0,
  copyPaste: 0,
  fullScreenExit: 0,
  eyeMomentCount: 0
};

const ProctoringProvider: React.FC<ProctoringProviderProps> = ({
  children,
  assessmentData,
  assessmentSubmitId,
  onSubmit,
  setIsFullScreen
}) => {
  const isCurrentPageRef = useRef(true);

  // Update proctoring data
  const updateProctoringData = async (type: 'tabChange' | 'copyPaste' | 'fullScreenExit') => {
    if (!assessmentSubmitId) return;

    proctoringData[type]++;
    
    try {
      await api.patch(`/proctoring/update/${assessmentSubmitId}`, proctoringData);
    } catch (error) {
      console.error('Error updating proctoring data:', error);
    }
  };

  // Handle visibility change (tab switching)
  const handleVisibilityChange = () => {
    if (!isCurrentPageRef.current) return;

    if (document.hidden && assessmentData?.canTabChange) {
      updateProctoringData('tabChange');
      toast({
        title: 'Tab Switch Detected',
        description: 'Switching tabs is not allowed during assessment',
        variant: 'destructive'
      });
      
      // Auto-submit after multiple violations
      if (proctoringData.tabChange >= 3) {
        toast({
          title: 'Assessment Auto-Submitted',
          description: 'Too many tab switching violations detected',
          variant: 'destructive'
        });
        onSubmit();
      }
    }
  };

  // Handle fullscreen change
  const handleFullscreenChange = () => {
    if (!isCurrentPageRef.current) return;

    const isCurrentlyFullscreen = isFullScreen();
    setIsFullScreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && assessmentData?.canScreenExit) {
      updateProctoringData('fullScreenExit');
      toast({
        title: 'Fullscreen Exit Detected',
        description: 'Exiting fullscreen will auto-submit your assessment',
        variant: 'destructive'
      });
      
      // Auto-submit immediately on fullscreen exit
      setTimeout(() => {
        onSubmit();
      }, 1000);
    }
  };

  // Handle copy/paste attempts
  const handleCopyPaste = (event: ClipboardEvent) => {
    if (!isCurrentPageRef.current) return;

    if (assessmentData?.canCopyPaste) {
      event.preventDefault();
      updateProctoringData('copyPaste');
      toast({
        title: 'Copy/Paste Blocked',
        description: 'Copy and paste operations are not allowed',
        variant: 'destructive'
      });
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isCurrentPageRef.current) return;

    // Block common keyboard shortcuts
    const blockedKeys = [
      'F12', // Developer tools
      'F11', // Fullscreen toggle
    ];

    const blockedCombinations = [
      { ctrl: true, shift: true, key: 'I' }, // Developer tools
      { ctrl: true, shift: true, key: 'J' }, // Console
      { ctrl: true, key: 'U' }, // View source
      { ctrl: true, key: 'S' }, // Save
      { ctrl: true, key: 'A' }, // Select all
      { ctrl: true, key: 'C' }, // Copy
      { ctrl: true, key: 'V' }, // Paste
      { ctrl: true, key: 'X' }, // Cut
      { alt: true, key: 'Tab' }, // Alt+Tab
      { meta: true, key: 'Tab' }, // Cmd+Tab (Mac)
    ];

    if (blockedKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    for (const combo of blockedCombinations) {
      if (
        (combo.ctrl && event.ctrlKey) ||
        (combo.shift && event.shiftKey) ||
        (combo.alt && event.altKey) ||
        (combo.meta && event.metaKey)
      ) {
        if (event.key.toLowerCase() === combo.key.toLowerCase()) {
          event.preventDefault();
          if (combo.key === 'C' || combo.key === 'V' || combo.key === 'X') {
            handleCopyPaste(event as any);
          }
          return;
        }
      }
    }
  };

  // Handle right-click
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    toast({
      title: 'Right Click Disabled',
      description: 'Right-click is disabled during assessment',
      variant: 'destructive'
    });
  };

  // Setup event listeners
  useEffect(() => {
    // Get initial proctoring data
    const fetchProctoringData = async () => {
      if (!assessmentSubmitId) return;
      
      try {
        const response = await api.get(`/proctoring/${assessmentSubmitId}`);
        proctoringData = response.data || proctoringData;
      } catch (error) {
        console.error('Error fetching proctoring data:', error);
      }
    };

    fetchProctoringData();

    // Add event listeners
    if (assessmentData?.canTabChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (assessmentData?.canScreenExit) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }

    if (assessmentData?.canCopyPaste) {
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      isCurrentPageRef.current = false;
    };
  }, [assessmentData, assessmentSubmitId]);

  return <div className="w-full h-full">{children}</div>;
};

export default ProctoringProvider; 