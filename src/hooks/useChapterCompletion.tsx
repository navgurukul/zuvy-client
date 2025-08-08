import { useState } from 'react';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import{UseChapterCompletionReturn,UseChapterCompletionParams } from '@/hooks/hookType'

const useChapterCompletion = ({ courseId, moduleId, chapterId, onSuccess }: UseChapterCompletionParams): UseChapterCompletionReturn => {
  const [isCompleting, setIsCompleting] = useState(false);

  const completeChapter = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      await api.post(`/tracking/updateChapterStatus/${courseId}/${moduleId}?chapterId=${chapterId}`);
      
      toast({
        title: "Chapter Completed!",
        description: "You've successfully marked this chapter as done.",
      });

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