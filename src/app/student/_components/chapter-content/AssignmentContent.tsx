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
import Link from 'next/link';
import useWindowSize from '@/hooks/useHeightWidth';
import {AssignmentContentProps,EditorDoc} from '@/app/student/_components/chapter-content/componentChapterType'

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



const AssignmentContent: React.FC<AssignmentContentProps> = ({ chapterDetails, onChapterComplete }) => {
  const { courseId, moduleId } = useParams();
  const { assignmentData, loading, error, refetch: refetchAssignmentDetails } = useAssignmentDetails(chapterDetails.id.toString());
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialContent, setInitialContent] = useState<EditorDoc | undefined>();
  const [localIsCompleted, setLocalIsCompleted] = useState(false);
  const [localSubmittedAt, setLocalSubmittedAt] = useState<string | null>(null);

  const { width } = useWindowSize();
  const isMobile = width < 768;
  const isSmallScreen = width < 1366;
  const [resourceLink, setResourceLink] = useState('');
  const [viewResource, setViewResource] = useState(false);

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

  useEffect(() => {
    if (chapterDetails.links) {
      let parsedLinks;
      try {
        parsedLinks = JSON.parse(chapterDetails.links);
        if (!Array.isArray(parsedLinks)) parsedLinks = [parsedLinks];
      } catch (e) {
        parsedLinks = [chapterDetails.links];
      }

      if (Array.isArray(parsedLinks) && parsedLinks.length > 0 && parsedLinks[0]) {
        setResourceLink(parsedLinks[0]);
        setViewResource(true);
      } else {
        setResourceLink('');
        setViewResource(false);
      }
    } else {
        setResourceLink('');
        setViewResource(false);
    }
  }, [chapterDetails.links]);

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
    if (!submittedAt) return 'Not Submitted';
    const deadline = new Date(deadlineDate!);
    if (isNaN(deadline.getTime())) return 'Processing...';
    const submittedDate = new Date(submittedAt);
    return submittedDate > deadline ? 'Late Submission' : 'Submitted on Time';
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`mx-auto space-y-6 ${isMobile ? 'p-4' : isSmallScreen ? 'p-6 max-w-3xl' : 'p-8 max-w-4xl'}`}>
        <div className="flex justify-between items-center">
          <Skeleton className={`${isMobile ? 'h-6 w-1/2' : 'h-8 w-1/2'}`} />
          <Skeleton className={`${isMobile ? 'h-5 w-20' : 'h-6 w-24'}`} />
        </div>
        <Skeleton className={`${isMobile ? 'h-3 w-1/2' : 'h-4 w-1/3'}`} />
        <Skeleton className={`${isMobile ? 'h-16' : 'h-24'} w-full`} />
        <Skeleton className={`${isMobile ? 'h-6 w-1/3' : 'h-8 w-1/4'}`} />
        <Skeleton className={`${isMobile ? 'h-8' : 'h-10'} w-full`} />
        <div className="flex justify-end">
          <Skeleton className={`${isMobile ? 'h-8 w-24' : 'h-10 w-32'}`} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={`mx-auto space-y-6 ${isMobile ? 'p-4' : isSmallScreen ? 'p-6 max-w-3xl' : 'p-8 max-w-4xl'}`}>
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className={`font-bold text-foreground mb-2 text-left ${isMobile ? 'text-xl' : isSmallScreen ? 'text-2xl' : 'text-3xl'}`}>
              {chapterDetails.title}
            </h1>
            <p className={`text-muted-foreground text-left ${isMobile ? 'text-sm' : 'text-base'}`}>
              Due: {formatDate(deadlineDate)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              variant={isCompleted ? "secondary" : "outline"}
              className={`${isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} px-3 py-1 text-left ${isMobile ? 'text-xs' : 'text-sm'}`}
            >
              {getSubmissionStatus()}
            </Badge>
          </div>
        </div>

        {/* Assignment Description */}
        <div className=" border border-border rounded-lg p-4 md:p-6">
          <div className="prose prose-neutral max-w-none text-left">
            {viewResource ? (
              isMobile ? (
                <div className="flex flex-col items-center justify-center py-6 md:py-8">
                  <p className={`mb-4 text-center text-muted-foreground ${isMobile ? 'text-sm' : 'text-base'}`}>
                    This assignment includes an external resource.
                  </p>
                  <Button asChild variant="outline" size={isMobile ? 'sm' : 'default'}>
                    <Link href={resourceLink} target="_blank" rel="noopener noreferrer">
                      View Resource
                    </Link>
                  </Button>
                </div>
              ) : (
                <iframe
                  src={resourceLink}
                  className={`w-full border border-border rounded ${isSmallScreen ? 'h-[300px]' : 'h-96'}`}
                  title="Assignment Resource"
                />
              )
            ) : (
              <div className={`text-left ${isMobile ? 'min-h-[150px]' : isSmallScreen ? 'min-h-[180px]' : 'min-h-[200px]'}`}>
                <RemirrorTextEditor 
                  initialContent={initialContent} 
                  setInitialContent={setInitialContent} 
                  preview={true} 
                  hideBorder={true}
                  assignmentSide={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submission Section */}
        <div className="rounded-lg ">
          <h2 className={`font-semibold text-foreground mb-4 text-left ${isMobile ? 'text-lg' : isSmallScreen ? 'text-xl' : 'text-xl'}`}>
            Make a Submission
          </h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                        placeholder="Paste your assignment link (Google Drive, GitHub, etc.)" 
                        {...field} 
                        disabled={isCompleted || isSubmitting || isCompleting}
                        className={`text-base text-left ${isMobile ? 'h-10 text-sm' : isSmallScreen ? 'h-11' : 'h-12'}`}
                      />
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
              
              {!isCompleted && (
                <div className="flex justify-start">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isCompleting || !form.formState.isValid}
                    className={`px-4 py-2 text-left bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover ${isMobile ? 'h-10 text-sm' : isSmallScreen ? 'h-5' : 'h-8'}`}
                  >
                    {isSubmitting || isCompleting ? 'Submitting...' : 'Submit Assignment'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AssignmentContent; 