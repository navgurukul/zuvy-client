import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import RemirrorTextEditor from "@/components/remirror-editor/RemirrorTextEditor";
import useAssignmentDetails from '@/hooks/useAssignmentDetails';
import useChapterCompletion from '@/hooks/useChapterCompletion';
import { api } from '@/utils/axios.config';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import useWindowSize from '@/hooks/useHeightWidth';
import { X } from 'lucide-react';
import {AssignmentContentProps,EditorDoc} from '@/app/student/_components/chapter-content/componentChapterType'
import {AssignmentSkeleton} from "@/app/student/_components/Skeletons";


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
  const [submissionLinks, setSubmissionLinks] = useState<string[]>(['']);
  const [validationError, setValidationError] = useState<string | undefined>();
  const [validationErrors, setValidationErrors] = useState<(string | undefined)[] | undefined>(undefined);

  const { isCompleting, completeChapter } = useChapterCompletion({
    courseId: courseId as string,
    moduleId: moduleId as string,
    chapterId: chapterDetails.id.toString(),
    onSuccess: () => {
      setLocalIsCompleted(true);
      onChapterComplete(); 
    },
  });

  useEffect(() => {
    if (assignmentData?.assignmentTracking?.[0]?.projectUrl) {
      const links = normalizeLinks(assignmentData.assignmentTracking[0].projectUrl);
      setSubmissionLinks(links.length > 0 ? links : ['']);
    }
  }, [assignmentData]);

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

  const handleSubmissionChange = (index: number, value: string) => {
    setSubmissionLinks((prev) => prev.map((link, i) => (i === index ? value : link)));
    setValidationError(undefined);
    setValidationErrors((prev) => prev?.map((err, i) => (i === index ? undefined : err)));
  };

  const handleAddLink = () => {
    setSubmissionLinks((prev) => [...prev, '']);
    setValidationErrors((prev) => (prev ? [...prev, undefined] : undefined));
  };

  const handleRemoveLink = (index: number) => {
    setSubmissionLinks((prev) => prev.filter((_, i) => i !== index));
    setValidationErrors((prev) => prev?.filter((_, i) => i !== index));
  };

  async function onSubmit() {
    const trimmedLinks = submissionLinks.map((link) => link.trim());
    const nonEmptyLinks = trimmedLinks.filter(Boolean);

    if (nonEmptyLinks.length === 0) {
      setValidationError('Please provide at least one submission link');
      setValidationErrors(
        submissionLinks.map((link) => (link.trim().length === 0 ? 'Please provide a link' : undefined))
      );
      return;
    }

    const invalidErrors = submissionLinks.map((link) => {
      const trimmedLink = link.trim();
      if (!trimmedLink) return undefined;
      return isValidUrl(trimmedLink) ? undefined : 'Please provide a valid URL';
    });

    if (invalidErrors.some(Boolean)) {
      setValidationError('Please fix the invalid link(s) below');
      setValidationErrors(invalidErrors);
      return;
    }

    setIsSubmitting(true);
    const today = new Date();
    const isoString = today.toISOString().split('.')[0] + 'Z';
    const submissionBody = {
      submitAssignment: { 
        projectUrl: nonEmptyLinks.join('\n'),
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
      setSubmissionLinks(nonEmptyLinks);
      setValidationError(undefined);
      setValidationErrors(undefined);
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

  const trimmedLinks = submissionLinks.map((link) => link.trim());
  const hasEmptyLink = trimmedLinks.some((link) => link.length === 0);
  const hasInvalidLink = trimmedLinks.some((link) => link.length > 0 && !isValidUrl(link));
  const isSubmitDisabled = isSubmitting || isCompleting || hasEmptyLink || hasInvalidLink;

  if (loading) {
    // return (
    //   <div className={`mx-auto space-y-6 ${isMobile ? 'p-4' : isSmallScreen ? 'p-6 max-w-3xl' : 'p-8 max-w-4xl'}`}>
    //     <div className="flex justify-between items-center">
    //       <Skeleton className={`${isMobile ? 'h-6 w-1/2' : 'h-8 w-1/2'}`} />
    //       <Skeleton className={`${isMobile ? 'h-5 w-20' : 'h-6 w-24'}`} />
    //     </div>
    //     <Skeleton className={`${isMobile ? 'h-3 w-1/2' : 'h-4 w-1/3'}`} />
    //     <Skeleton className={`${isMobile ? 'h-16' : 'h-24'} w-full`} />
    //     <Skeleton className={`${isMobile ? 'h-6 w-1/3' : 'h-8 w-1/4'}`} />
    //     <Skeleton className={`${isMobile ? 'h-8' : 'h-10'} w-full`} />
    //     <div className="flex justify-end">
    //       <Skeleton className={`${isMobile ? 'h-8 w-24' : 'h-10 w-32'}`} />
    //     </div>
    //   </div>
    // );
  }

     if (loading) {
        return <AssignmentSkeleton/>;
      }

      
  return (
    <div className="min-h-screen bg-background">
       <ScrollArea className={`${isMobile ? 'h-[75vh]' : 'h-[80vh]'}`}  >

      <div className={`mx-auto space-y-6 ${isMobile ? 'p-4' : isSmallScreen ? 'p-6 max-w-3xl' : 'p-8 max-w-4xl'}`}>
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className={`font-bold text-foreground mb-2 text-left ${isMobile ? 'text-xl' : isSmallScreen ? 'text-2xl' : 'text-xl'}`}>
              {chapterDetails.title}
            </h1>
            <p className={`text-muted-foreground text-left ${isMobile ? 'text-sm' : 'text-base'}`}>
              Due: {formatDate(deadlineDate)}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge 
              variant={isCompleted ? "secondary" : "outline"}
              className={`${isCompleted ? 'bg-green-100 text-green-800 hover:text-white' : 'bg-gray-100 text-gray-600'} px-3 py-1 text-left ${isMobile ? 'text-xs' : 'text-sm'}`}
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
          <div className="space-y-4">
            <div className="space-y-2 w-full">
              <p className="text-left text-md text-muted-foreground">Submission Links</p>
              <div className="space-y-3">
                {submissionLinks.map((link, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Input
                        id={`assignment-submission-link-${index}`}
                        type="url"
                        placeholder="https://github.com/your-username/repo or any valid URL"
                        value={link}
                        onChange={(e) => handleSubmissionChange(index, e.target.value)}
                        disabled={isCompleted || isSubmitting || isCompleting}
                        className={`text-base text-left ${isMobile ? 'h-10 text-sm' : isSmallScreen ? 'h-11' : 'h-12'} ${validationErrors?.[index] || (link.trim().length > 0 && !isValidUrl(link.trim())) ? "border-destructive" : ""}`}
                      />
                      {!isCompleted && submissionLinks.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          className="shrink-0 mt-3 px-3"
                          onClick={() => handleRemoveLink(index)}
                          disabled={isSubmitting || isCompleting}
                          aria-label={`Remove link ${index + 1}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {link.trim().length > 0 && !isValidUrl(link.trim()) && (
                      <p className="text-sm text-destructive">Please provide a valid URL</p>
                    )}
                  </div>
                ))}
                {!isCompleted && (
                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddLink}
                      disabled={isSubmitting || isCompleting}
                    >
                      Add another link
                    </Button>
                  </div>
                )}
              </div>
              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}
              {!isCompleted && (
                <p className="text-sm text-left text-muted-foreground">
                  Provide one or more links to your assignment (GitHub, GitLab, Drive, or any valid URL).
                </p>
              )}
            </div>
            {!isCompleted && (
              <div className="flex justify-start">
                <Button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitDisabled}
                  className={`px-4 py-2 text-left bg-primary hover:bg-primary-dark text-primary-foreground shadow-hover `}
                >
                  {isSubmitting || isCompleting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
       </ScrollArea>
    </div>
  );
};

export default AssignmentContent; 

const normalizeLinks = (links?: string | string[]): string[] => {
  if (!links) return [];
  if (Array.isArray(links)) {
    return links.map((link) => link.trim()).filter(Boolean);
  }
  return links
    .split(/\r?\n+/)
    .map((link) => link.trim())
    .filter(Boolean);
};

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (!url.hostname) return false;
    if (url.hostname === 'localhost') return true;
    if (url.hostname.endsWith('.')) return false;
    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length < 2) return false;
    const tld = hostnameParts[hostnameParts.length - 1];
    if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;
    return hostnameParts.every((part) => /^[a-zA-Z0-9-]+$/.test(part) && part.length > 0);
  } catch {
    return false;
  }
};
