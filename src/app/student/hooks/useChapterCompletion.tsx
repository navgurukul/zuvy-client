import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { UseChapterCompletionReturn, UseChapterCompletionParams } from './hookTypes'

import { chapterRewardManager } from '@/app/student/_components/reward/chapterRewardManager';

const useChapterCompletion = ({ courseId, moduleId, chapterId, onSuccess, skipRewardManager = false }: UseChapterCompletionParams): UseChapterCompletionReturn => {
  const [isCompleting, setIsCompleting] = useState(false);

  const completeChapter = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      await api.post(`/tracking/updateChapterStatus/${courseId}/${moduleId}?chapterId=${chapterId}`);

      // Register completion event for reward animation.
      // Skipped when the caller manages its own reward display (e.g. coding challenge editor)
      // to prevent the module page from firing a duplicate reward on the next navigation.
      if (chapterId && !skipRewardManager) {
        chapterRewardManager.markChapterCompleted(chapterId);
      }

      // toast({
      //   title: "Chapter Completed!",
      //   description: "You've successfully marked this chapter as done.",
      // });

      // Execute the success callback for an instant UI update
      onSuccess?.();

    } catch (error: any) {
      console.error('Error completing chapter:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to mark chapter as complete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    isCompleting,
    completeChapter
  };
};

export default useChapterCompletion; 