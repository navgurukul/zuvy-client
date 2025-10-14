'use client';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {ProjectPageSkeleton}  from "@/app/student/_components/Skeletons"
import { 
  X, 
  FileText, 
  ExternalLink,
  Download,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import useProjectDetails from "@/hooks/useProjectDetails";
import useProjectSubmission from "@/hooks/useProjectSubmission";
import RemirrorTextEditor from "@/components/remirror-editor/RemirrorTextEditor";
import {ProjectState,ParagraphContentItem} from '@/app/student/_pages/pageStudentType'


const ProjectPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  
  const projectId = searchParams.get('projectId');
  const moduleId = searchParams.get('moduleId');
  const courseId = params.courseId;
  
  const [projectState, setProjectState] = useState<ProjectState>({
    submissionLink: '',
    isSubmitted: false
  });
  
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [initialContent, setInitialContent] = useState<any>(undefined);

  // Fetch project data using the custom hook
  const { 
    projectData, 
    status, 
    loading, 
    error,
    refetch: refetchProjectDetails
  } = useProjectDetails(projectId || '', moduleId || '');

  // Get the first project from the array (assuming single project per module)
  const project = projectData[0];

  const { submitProject, isSubmitting, error: submissionError } = useProjectSubmission();

  useEffect(() => {
    if (project) {
      // Initialize state based on project status
      setProjectState({
        submissionLink: '', // Initialize empty as we don't have submission data yet
        isSubmitted: status === 'Completed',
        submittedAt: status === 'Completed' ? new Date() : undefined
      });
    }
  }, [project, status]);

  useEffect(() => {
    if (project?.instruction?.description) {
      try {
        const parsedContent = JSON.parse(project?.instruction?.description);
        setInitialContent(parsedContent.doc ? parsedContent : { doc: parsedContent });
      } catch {
        setInitialContent({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: project?.instruction?.description }] }] });
      }
    }
  }, [project]);

  if (loading) {
    // return (
    //   <div className="min-h-screen bg-background">
    //     <div className="container mx-auto px-4 py-8">
    //       <div className="text-center">
    //         <h1 className="text-2xl font-heading font-bold mb-4">Loading Project...</h1>
    //         <p className="text-muted-foreground">Please wait while we fetch the project details.</p>
    //       </div>
    //     </div>
    //   </div>
    // );

    return<ProjectPageSkeleton/>
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || 'The requested project could not be found.'}</p>
            <Button onClick={() => router.push(`/student/course/${courseId}`)}>
              <X className="w-4 h-4 mr-2" />
              Back to Course Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Parse the instruction description (assuming it's JSON)
  let projectDescription = '';
  try {
    if (project.instruction?.description) {
      const parsed = JSON.parse(project.instruction.description);
      // Extract text content from the parsed JSON structure
      if (parsed.doc?.content) {
        projectDescription = extractTextFromContent(parsed.doc.content);
      }
    }
  } catch (e) {
    // Fallback to raw description if parsing fails
    projectDescription = project.instruction?.description || 'No description available';
  }

  const isDescriptionLong = projectDescription.split('\n').length > 15 || projectDescription.length > 800;
  const displayDescription = showFullDescription || !isDescriptionLong 
    ? projectDescription 
    : projectDescription.slice(0, 400) + '...';

  const handleSubmissionChange = (value: string) => {
    setProjectState(prev => ({
      ...prev,
      submissionLink: value,
      validationError: undefined
    }));
  };

  const handleSubmit = async () => {
    if (!projectState.submissionLink.trim()) {
      setProjectState(prev => ({
        ...prev,
        validationError: 'Please provide a submission link'
      }));
      return;
    }

    // Validate URL format
    try {
      const url = new URL(projectState.submissionLink);
      const isGitHub = url.hostname.includes('github.com');
      const isGoogleDrive = url.hostname.includes('drive.google.com');
      
      if (!isGitHub && !isGoogleDrive) {
        setProjectState(prev => ({
          ...prev,
          validationError: 'Please provide a valid GitHub or Google Drive link'
        }));
        return;
      }
    } catch {
      setProjectState(prev => ({
        ...prev,
        validationError: 'Please provide a valid URL'
      }));
      return;
    }

    // Submit project using the hook
    const success = await submitProject(
      projectState.submissionLink,
      projectId || '',
      moduleId || '',
      courseId as string
    );

    if (success) {
      setProjectState(prev => ({
        ...prev,
        isSubmitted: true,
        submittedAt: new Date(),
        validationError: undefined
      }));
      
      // Refetch project details to get updated status
      try {
        await refetchProjectDetails();
      } catch (error) {
        console.error('Error refetching project details:', error);
      }
    } else {
      // Error is handled by the hook, but we can show it in the UI if needed
      setProjectState(prev => ({
        ...prev,
        validationError: submissionError || 'Failed to submit project'
      }));
    }
  };

  const handleResubmit = () => {
    setProjectState(prev => ({
      ...prev,
      isSubmitted: false,
      submittedAt: undefined,
      validationError: undefined
    }));
  };

  const isDueDatePassed = new Date() > new Date(project.deadline);

  return (
    <div className="min-h-screen font-semibold bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-primary hover:text-primary hover:underline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span  className="font-semibold" >Back to Course Dashboard</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Title */}
          <div>
            <h1 className="text-3xl text-left font-heading font-bold">{project.title}</h1>
          </div>

          {/* Due Date and Time/Submission Info */}
          <div className="space-y-12">
            <div className="flex items-center space-x-6">
              <div>
                <p className="text-sm text-left text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(project.deadline)}</p>
              </div>
              {!projectState.isSubmitted ? (
                <div>
                  <p className="text-sm text-left text-muted-foreground">Time Remaining</p>
                  <p className={`font-medium ${isDueDatePassed ? 'text-destructive' : 'text-success'}`}>
                    {isDueDatePassed ? 'Deadline passed' : '5 days remaining'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-left text-muted-foreground">Submitted on</p>
                  <p className="font-medium text-left">{projectState.submittedAt ? formatDate(projectState.submittedAt.toISOString()) : ""}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Description */}
          {/* <div className="space-y-4">
            <h2 className="text-xl font-heading text-left font-semibold">Project Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-left text-muted-foreground leading-relaxed">
                {displayDescription}
              </p>
            </div>
            {isDescriptionLong && (
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-left"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Full Description
                  </>
                )}
              </Button>
            )}
          </div> */}

          {/* Project Content */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading text-left font-semibold">Project Content</h2>
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="prose prose-neutral max-w-none text-left">
                <div className="min-h-[200px]">
                  <RemirrorTextEditor 
                    initialContent={initialContent} 
                    setInitialContent={setInitialContent} 
                    preview={true} 
                    hideBorder={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Submission */}
          <div className="space-y-6">
            <h2 className="text-xl text-left font-heading font-semibold">Project Submission</h2>
            <div className="space-y-6">
              {!projectState.isSubmitted ? (
                <div className="space-y-4">
                  <div className="space-y-2 w-full">
                    <p className="text-left  text-md text-muted-foreground" >Submission Link</p>
                    <Input
                      id="submission-link"
                      type="url"
                      placeholder="https://github.com/your-username/project-repo or https://drive.google.com/..."
                      value={projectState.submissionLink}
                      onChange={(e) => handleSubmissionChange(e.target.value)}
                      className={projectState.validationError ? "border-destructive" : ""}
                    />
                    {projectState.validationError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{projectState.validationError}</AlertDescription>
                      </Alert>
                    )}
                    <p className="text-sm text-left text-muted-foreground">
                      Provide a link to your project repository (GitHub, GitLab, etc.) or Google Drive link.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleSubmit}
                      className="w-auto font-semibold bg-primary text-white hover:bg-primary/80"

                      disabled={isDueDatePassed || isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Project'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-success-light border-success shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <h3 className="text-lg font-semibold text-success">
                          Project Submitted Successfully!
                        </h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base">Your Submission</Label>
                          <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg mt-2">
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={project?.projectTrackingData[0]?.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary text-left hover:underline font-medium flex-1"
                            >
                              {project?.projectTrackingData[0]?.projectLink } 
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-2 text-center">
                    <p className="text-sm text-muted-foreground">
                      Need to make changes? You can resubmit your project before the deadline.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={handleResubmit} 
                      className="border-primary text-primary hover:bg-primary/10 font-semibold"
                      disabled={isDueDatePassed}
                    >
                      Resubmit Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract text from the JSON content structure
const extractTextFromContent = (content: ParagraphContentItem[]): string => {
  let text = '';
  content.forEach((item) => {
    if (item.type === 'paragraph' && item.content) {
      item.content.forEach((textItem) => {
        if (textItem.type === 'text') {
          text += textItem.text + ' ';
        }
      });
      text += '\n';
    }
  });
  
  return text.trim();
};

export default ProjectPage;
