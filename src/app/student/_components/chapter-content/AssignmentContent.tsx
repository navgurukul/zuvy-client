import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ScrollArea } from '@/components/ui/scroll-area';
import RemirrorTextEditor from "@/components/remirror-editor/RemirrorTextEditor";
import useAssignmentDetails from '@/hooks/useAssignmentDetails';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
  link: z
    .string()
    .url({ message: 'Please enter a valid URL.' })
    .refine(
      (url) =>
        url.startsWith('https://github.com') ||
        url.startsWith('https://drive.google.com') ||
        url.startsWith('https://docs.google.com/document') ||
        url.startsWith('https://docs.google.com/spreadsheets'),
      {
        message: 'Only links from Google Drive, GitHub, Google Docs, or Google Sheets are allowed.',
      }
    ),
});

type EditorDoc = {
  type: string;
  content: any[];
};

interface AssignmentContentProps {
  chapterDetails: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    articleContent: string | null;
  };
  onChapterComplete: () => void;
}

const AssignmentContent: React.FC<AssignmentContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId, moduleId } = useParams();
  const { assignmentData, loading, error, refetch: refetchAssignmentDetails } = useAssignmentDetails(chapterDetails.id.toString());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialContent, setInitialContent] = useState<EditorDoc | undefined>();
  const [localIsCompleted, setLocalIsCompleted] = useState(false);
  const [localSubmittedAt, setLocalSubmittedAt] = useState<string | null>(null);

  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseId as string,
    moduleId: moduleId as string,
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setLocalIsCompleted(true);
      onChapterComplete(); 
    },
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { link: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (assignmentData?.assignmentTracking?.[0]?.projectUrl) {
      form.setValue('link', assignmentData.assignmentTracking[0].projectUrl);
    }
  }, [assignmentData, form]);

  useEffect(() => {
    if (chapterDetails.articleContent) {
      try {
        const parsedContent = JSON.parse(chapterDetails.articleContent);
        setInitialContent(parsedContent.doc ? parsedContent : { doc: parsedContent });
      } catch {
        // Fallback for non-JSON content
        setInitialContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: chapterDetails.articleContent }] }] });
      }
    }
  }, [chapterDetails.articleContent]);

  // Update local state when assignment data changes
  useEffect(() => {
    if (assignmentData) {
      setLocalIsCompleted(assignmentData.status === 'Completed');
      setLocalSubmittedAt(assignmentData.assignmentTracking?.[0]?.createdAt || null);
    }
  }, [assignmentData]);

  const deadlineDate = assignmentData?.chapterDetails?.completionDate;
  const submittedAt = localSubmittedAt || assignmentData?.assignmentTracking?.[0]?.createdAt;
  const isCompleted = localIsCompleted || assignmentData?.status === 'Completed';

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    const today = new Date();
    const isoString = today.toISOString().split('.')[0] + 'Z';
    const submissionBody = {
      submitAssignment: { 
        projectUrl: data.link,
        timeLimit: isoString,
      },
    };

    try {
      await api.post(
        `/tracking/updateQuizAndAssignmentStatus/${courseId}/${moduleId}?chapterId=${chapterDetails.id}`,
        submissionBody
      );

      await completeChapter();
      
      setLocalSubmittedAt(isoString);
      refetchAssignmentDetails();

    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit assignment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getSubmissionStatus = () => {
    if (!submittedAt) return <span className="text-orange-500">Not Submitted</span>;
    const deadline = new Date(deadlineDate!);
    if (isNaN(deadline.getTime())) return <span className="text-gray-500">Processing...</span>;
    const submittedDate = new Date(submittedAt);
    return submittedDate > deadline ? <span className="text-red-500">Late Submission</span> : <span className="text-green-500">Submitted on Time</span>;
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-left">{chapterDetails.title}</h1>
        <Badge variant={isCompleted ? "secondary" : "outline"}>
          {isCompleted ? 'Completed' : 'Pending'}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4 text-left space-y-1">
        <p><strong>Deadline:</strong> {formatDate(deadlineDate)}</p>
        <p><strong>Status:</strong> {getSubmissionStatus()}</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-left">Assignment Description</h2>
        <div className="text-left bg-muted/30 p-4 rounded-md border h-[300px] overflow-hidden">
          <div className="h-full">
            <RemirrorTextEditor 
              initialContent={initialContent} 
              setInitialContent={setInitialContent} 
              preview={true} 
            />
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-lg font-semibold text-left">Submit Your Work</h2>
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Paste your assignment link (Google Drive, GitHub, etc.)" {...field} disabled={isCompleted || isSubmitting || isCompleting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {!isCompleted && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isCompleting || !form.formState.isValid}>
                {isSubmitting || isCompleting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AssignmentContent; 