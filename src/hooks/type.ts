// useAllChaptersWithStatus

import { useAllModulesForStudents } from "./useAllModulesForStudents";
import useAssignmentDetails from "./useAssignmentDetails";
import { useBootcampProgress } from "./useBootcampProgress";
import useChapterCompletion from "./useChapterCompletion";
import useChapterDetails from "./useChapterDetails";
import useCodingSubmissions from "./useCodingSubmissions";
import { useCompletedClasses } from "./useCompletedClasses";
import useCourseSyllabus from "./useCourseSyllabus";
import { useFeedbackForm } from "./useFeedbackForm";
import useGetMCQs from "./useGetMcq";
import useQuizResults from "./useQuizResults";
import { useStudentData } from "./useStudentData";
import { useUpcomingEvents } from "./useUpcomingEvents";

export interface ChapterTrackingDetail {
  id: number;
}

export interface TrackingDataItem {
  id: number;
  title: string;
  topicId: number;
  chapterTrackingDetails: ChapterTrackingDetail[];
  status: 'Pending' | 'Completed';
}

export interface ModuleDetail {
  id: number;
  typeId: number;
  isLock: boolean;
  bootcampId: number;
  name: string;
  description: string;
  projectId: number | null;
  order: number;
  timeAlloted: number;
  version: number | null;
}

export interface AllChaptersWithStatusResponse {
  status: string;
  code: number;
  trackingData: TrackingDataItem[];
  moduleDetails: ModuleDetail[];
}

export interface UseAllChaptersWithStatusReturn {
  trackingData: TrackingDataItem[];
  moduleDetails: ModuleDetail[];
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => void;
}






// useAllModulesForStudents

export interface Module {
  id: number;
  name: string;
  description: string;
  typeId: number;
  order: number;
  projectId: number | null;
  isLock: boolean;
  timeAlloted: number;
  progress: number;
  ChapterId: number;
  quizCount: number;
  assignmentCount: number;
  codingProblemsCount: number;
  articlesCount: number;
  formCount: number;
}

export interface UseAllModulesForStudentsReturn {
  modules: Module[];
  loading: boolean;
  error: string | null;
}


// UseAssessmentDetailsResponse

export interface AssessmentDetails {
  status: string;
  statusCode: number;
  assessmentState: string;
  message: string;
  id: number;
  assessmentId: number;
  bootcampId: number;
  moduleId: number;
  chapterId: number;
  codingQuestionTagId: number[];
  mcqTagId: number[];
  easyCodingQuestions: number;
  mediumCodingQuestions: number;
  hardCodingQuestions: number;
  totalCodingQuestions: number;
  totalMcqQuestions: number;
  easyMcqQuestions: number;
  mediumMcqQuestions: number;
  hardMcqQuestions: number;
  weightageCodingQuestions: number;
  weightageMcqQuestions: number;
  easyCodingMark: number;
  mediumCodingMark: number;
  hardCodingMark: number;
  easyMcqMark: number;
  mediumMcqMark: number;
  hardMcqMark: number;
  tabChange: any | null;
  webCamera: any | null;
  passPercentage: number;
  screenRecord: any | null;
  embeddedGoogleSearch: any | null;
  deadline: string | null;
  timeLimit: number;
  marks: any | null;
  copyPaste: any | null;
  order: number;
  canEyeTrack: boolean;
  canTabChange: boolean;
  canScreenExit: boolean;
  canCopyPaste: boolean;
  publishDatetime: string;
  startDatetime: string;
  endDatetime: string;
  unpublishDatetime: string | null;
  currentState: number;
  createdAt: string;
  updatedAt: string;
  version: any | null;
  submitedOutsourseAssessments: any[];
  ModuleAssessment: {
    id: number;
    title: string;
    description: string;
  };
  totalQuizzes: number;
  totalOpenEndedQuestions: number;
}

export interface UseAssessmentDetailsResponse {
  assessmentDetails: AssessmentDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}




// useAssignmentDetails
export interface AssignmentTracking {
  id: number;
  projectUrl: string;
  timeLimit: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  chapterId: number;
  bootcampId: number;
  moduleId: number;
}

export interface AssignmentChapterDetails {
  completionDate: string; 
}

export interface AssignmentDetailsData {
  assignmentTracking: AssignmentTracking[];
  chapterDetails: AssignmentChapterDetails;
  status: 'Completed' | 'Pending';
  quizDetails?: any[];
}

export interface ApiResponse {
  data: AssignmentDetailsData;
}

export interface UseAssignmentDetailsReturn {
  assignmentData: AssignmentDetailsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}




// useBootcampProgress
export interface BootcampTracking {
  id: number;
  name: string;
  description: string | null;
  collaborator: string | null;
  coverImage: string;
  bootcampTopic: string;
  startTime: string;
  duration: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  version: string | null;
}

export interface InstructorDetails {
  instructorId: number;
  instructorName: string;
  instructorProfilePicture: string | null;
}

export interface BatchInfo {
  batchName: string;
  totalEnrolledStudents: number;
}

export interface BootcampProgressData {
  id: number;
  userId: number;
  progress: number;
  bootcampId: number;
  createdAt: string;
  updatedAt: string;
  version: string | null;
  bootcampTracking: BootcampTracking;
}

export interface BootcampProgressResponse {
  status: string;
  message: string;
  data: BootcampProgressData;
  instructorDetails: InstructorDetails;
  batchInfo: BatchInfo;
}




// useChapterCompletion
export interface UseChapterCompletionParams {
  courseId: string;
  moduleId: string;
  chapterId: string;
  onSuccess?: () => void;
}

export interface UseChapterCompletionReturn {
  isCompleting: boolean;
  completeChapter: () => Promise<void>;
}




// useChapterDetails
export interface ChapterDetails {
  id: number;
  title: string;
  description: string | null;
  topicId: number;
  moduleId: number;
  file: string | null;
  links: string | null;
  articleContent: string | null;
  quizQuestions: any | null;
  codingQuestions: any | null;
  formQuestions: any | null;
  assessmentId: number | null;
  completionDate: string | null;
  order: number;
  version: string | null;
  chapterTrackingDetails: any[];
  status: string;
}

export interface UseChapterDetailsResponse {
  chapterDetails: ChapterDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


export interface ChapterDetailsApiResponse {
  status: 'success' | 'error';
  trackingData: ChapterDetails;
}



// useCodingSubmissions
export interface CodingSubmissionsResponse {
  status?: string;
  action?: string;
  message?: string;
  data?: {
    sourceCode: string;
    TestCasesSubmission: any[];
  };
}

export interface UseCodingSubmissionsParams {
  codingOutsourseId: string | null;
  assessmentSubmissionId: string | null;
  questionId: string | null;
  enabled?: boolean;
}




// useCompletedClasses
export interface CompletedClass {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  attendanceStatus: 'present' | 'absent';
  duration: number;
  s3Link: string;
}

export interface AttendanceStats {
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
}

export interface CompletedClassesData {
  batchId: number;
  batchName: string;
  classes: CompletedClass[];
  totalClasses: number;
  totalPages: number;
  attendanceStats: AttendanceStats;
}

export interface UseCompletedClassesReturn {
  completedClassesData: CompletedClassesData | null;
  loading: boolean;
  error: string | null;
}


export interface CompletedClassesApiResponse {
  isSuccess: boolean;
  message: string;
  data: CompletedClass[];
}




// useCourseSyllabus
export interface Chapter {
  chapterId: number;
  chapterName: string;
  chapterDescription: string | null;
  chapterType: string;
  chapterDuration: string;
  chapterOrder: number;
}

export interface Module {
  moduleId: number;
  moduleName: string;
  moduleDescription: string;
  moduleDuration: string;
  chapters: Chapter[];
}

export interface CourseSyllabusData {
  bootcampId: number;
  bootcampName: string;
  bootcampDescription: string;
  collaboratorName: string;
  courseDuration: string;
  totalStudentsInCourse: number;
  studentBatchId: number;
  studentBatchName: string;
  instructorName: string;
  instructorProfilePicture: string | null;
  modules: Module[];
  coverImage: string;
  collaboratorImage: string;
}

export interface ApiResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  // data: CourseSyllabusData;
}

export interface UseCourseSyllabusReturn {
  syllabusData: CourseSyllabusData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}




// useFeedbackForm
export interface UseFeedbackFormProps {
    moduleId: string
    chapterId: number
    bootcampId: number
    onSuccess?: () => void
}

export interface FeedbackFormResponse {
    questions: any[]
    trackedData: any[]
    message?: string;
    status: string
}



// useGetMCQs
export interface Tag {
  id: number
  newTab:string
  tagName: string
}

export interface Props{
    id: number
    tags?: Tag[]
    assesmentSide?: boolean
}

export interface QuizVariant {
  id: number
  question: string
  options: string[]
  correctAnswer: string
}

export interface Quiz {
  id: number
  question: string
  difficulty: string
  tagId: number
  quizVariants: QuizVariant[]
}

export interface QuizApiResponse {
  data: Quiz[]
}



// useQuizResults
export interface QuizOption {
  [key: string]: string;
}

export interface SubmissionData {
  status: string;
  chosenOption?: number;
}

export interface QuizResult {
  quizId: number;
  question: string;
  options: QuizOption;
  correctOption: number;
  mark: string;
  difficulty: string;
  submissionsData?: SubmissionData;
}

export interface QuizResultsResponse {
  mcqs: QuizResult[];
  data:[]
}

export interface UseQuizResultsParams {
  submissionId: string | null;
  enabled?: boolean;
}



// useStudentData
export interface InstructorDetails {
  id: number;
  name: string;
  profilePicture: string | null;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  type: string;
}

export interface Bootcamp {
  id: number;
  name: string;
  coverImage: string;
  duration: string;
  language: string;
  bootcampTopic: string;
  description: string | null;
  batchId: number;
  batchName: string;
  progress: number;
  instructorDetails: InstructorDetails;
  upcomingEvents: UpcomingEvent[];
}

export interface StudentData {
  completedBootcamps: Bootcamp[];
  inProgressBootcamps: Bootcamp[];
  totalCompleted: number;
  totalInProgress: number;
  totalPages: number;
}



// useUpcomingEvents
export interface Event {
  type: "Live Class" | "Assessment" | "Assignment";
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  bootcampId: number;
  bootcampName: string;
  batchId: number;
  eventDate: string;
  moduleId: number;
  chapterId: number;
}

export interface UpcomingEventsData {
  events: Event[];
  totalEvents: number;
  totalPages: number;
}

export interface UseUpcomingEventsReturn {
  upcomingEventsData: UpcomingEventsData | null;
  loading: boolean;
  error: string | null;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
}

export interface UpcomingEventResponse {
  isSuccess: boolean;
  message: string;
  data: UpcomingEvent[];
}