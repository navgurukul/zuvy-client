// UseAllChaptersWithStatus
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




// UseAllModulesForStudents

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
  topic: string;
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


// UseAssignmentDetailsReturn
export interface AssignmentTracking {
  id: number;
  projectUrl: string | string[];
  timeLimit: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  chapterId: number;
  bootcampId: number;
  moduleId: number;
}

export interface AssignmentChapterDetails {
  completionDate: string; // This is the deadline
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



// BootcampProgressResponse 

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



// UseChapterDetails
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

export interface ChapterDetailsResponse {
  status: 'success' | 'error';
  trackingData: ChapterDetails;
}


// useCodingChallenge
export interface UseCodingChallengeProps {
  questionId: string;
  onChapterComplete?: () => void;
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





// useCompletedClass
export interface CompletedClass {
  moduleId: any;
  chapterId: any;
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

export interface CompletedClassesResponse {
  data: any;
  message: string;
  isSuccess: boolean;
}
export interface UseCompletedClassesReturn {
  completedClassesData: CompletedClassesData | null;
  loading: boolean;
  error: string | null;
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
  isLock: boolean
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

export interface ApiResponses {
  message: string;
  code: number;
  isSuccess: boolean;
  data: CourseSyllabusData;
}



export interface UseCourseSyllabusReturn {
  syllabusData: CourseSyllabusData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}



// UseFeedbackForm
export interface UseFeedbackFormProps {
  moduleId: string
  chapterId: number
  bootcampId: number
  onSuccess?: () => void
}

type QuestionType = 'mcq' | 'checkbox' | 'text' | 'date' | 'time';

export interface FeedbackQuestion {
  id: string;
  question: string;
  type: QuestionType;
  options?: { id: string; label: string }[];
  required: boolean;
}

export interface FeedbackTracking {
  questionId: string;
  selectedOptions?: string[];
  answerText?: string;
  answerDate?: string;
  answerTime?: string;
}

export interface FeedbackFormResponse {
  questions: FeedbackQuestion[];
  trackedData: FeedbackTracking[];
  status: string;
}



// useGetMCQs

export interface QuizVariant {
  id: number;
  text: string;
}

export interface QuizData {
  id: number;
  question: string;
  difficulty: string;
  tagId: number;
  quizVariants: QuizVariant[];
}

export interface QuizApiResponse {
  data: QuizData[];
}

export interface Tag {
  id: number;
  tagName: string;
}

export interface Props {
  id: number;
  tags?: Tag[];
  assesmentSide?: boolean;
}




// useLatestUpdatedCourse
export interface NewChapter {
  id: number;
  title: string;
  topicId: number;
  chapterTrackingDetails: any[];
}

export interface LatestUpdatedCourseData {
  moduleId: number;
  moduleName: string;
  typeId: number;
  bootcampId: number;
  bootcampName: string;
  newChapter: NewChapter;
}

export interface LatestUpdatedCourseResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  data: LatestUpdatedCourseData;
}






// useProjectDetails
export interface ProjectInstruction {
  description: string;
}

export interface ProjectTrackingData {
  // Add tracking data properties as needed
  projectLink: string | string[];
}

export interface ProjectData {
  id: number;
  title: string;
  instruction: ProjectInstruction;
  isLock: boolean;
  deadline: string;
  version: number | null;
  projectTrackingData: ProjectTrackingData[];
}

export interface ProjectDetailsResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  data: {
    moduleId: number;
    bootcampId: number;
    typeId: number;
    projectData: ProjectData[];
    status: 'Pending' | 'Completed';
  };
}

export interface UseProjectDetailsReturn {
  projectData: ProjectData[];
  moduleId: number;
  bootcampId: number;
  typeId: number;
  status: 'Pending' | 'Completed';
  loading: boolean;
  isRefetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}



// UseProjectSubmission
export interface ProjectSubmissionResponse {
  message: string;
  status: string;
  data?: any;
}

export interface UseProjectSubmissionReturn {
  submitProject: (projectLinks: string[], projectId: string, moduleId: string, courseId: string) => Promise<boolean>;
  isSubmitting: boolean;
  error: string | null;
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
  chapterId: any;
  hangoutLink?: string;
  moduleId: any;
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
  courseOrgName?: string;
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

// useBootcampSettings.tsx
export interface BootcampSettingsData {
  type: string;
  isModuleLocked: boolean;
}

export interface UseBootcampSettingsReturn {
  bootcampSettings: BootcampSettingsData | null;
  loading: boolean;
  error: string | null;
  updateError: string | null; // Add this
  updateSettings: (settings: BootcampSettingsData) => Promise<void>;
  refetch: () => Promise<void>;
}

// useBootcampDelete.tsx
export interface UseBootcampDeleteReturn {
  deleteBootcamp: (bootcampId: string) => Promise<void>
  isDeleting: boolean
  error: string | null
}

export interface coursePermissions {
  createCourse: boolean;
  viewCourse: boolean;
  editCourse: boolean;
  deleteCourse: boolean;
  viewContent: boolean;
  viewRolesAndPermissions: boolean;
};


// useCreateCodingQuestion
export interface CreateCodingQuestionData {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tagId: number;
  constraints: string;
  testCases: Array<{
    inputs: Array<{
      parameterType: string;
      parameterValue: any;
      parameterName: string;
    }>;
    expectedOutput: {
      parameterType: string;
      parameterValue: any;
    };
  } | null>;
  createdAt: string;
  updatedAt: string;
  content: any;
}

export interface UseCreateCodingQuestionReturn {
  createQuestion: (data: CreateCodingQuestionData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}



// useEditCodingQuestion
export interface EditCodingQuestionData {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tagId: number;
  constraints: string;
  testCases: Array<{
    inputs: Array<{
      parameterType: string;
      parameterValue: any;
      parameterName: string;
    }>;
    expectedOutput: {
      parameterType: string;
      parameterValue: any;
    };
  } | null>;
  updatedAt: string;
  content: any;
}

export interface UseEditCodingQuestionReturn {
  editQuestion: (orgId: number, questionId: number | null, data: EditCodingQuestionData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}


// useCreateOpenEndedQuestion
export interface CreateOpenEndedQuestionData {
  question: string;
  tagId: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface UseCreateOpenEndedQuestionReturn {
  createOpenEndedQuestion: (data: CreateOpenEndedQuestionData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Tracking Log Types
export interface TrackingLogEntry {
  id: number
  orgId: number
  actorUserId: number
  actorName: string
  actorEmail: string
  permissionId: number
  resourceId: number
  action: string
  resourceType: string
  description: string
  createdAt: string
  status: string
  actorRoles: string[]
}

export interface TrackingLogPagination {
  offset: number
  limit: number
  total: number
}

export interface TrackingLogData {
  logs: TrackingLogEntry[]
  pagination: TrackingLogPagination
}

export interface TrackingLogResponse {
  success: boolean
  message: string
  data: TrackingLogData
}

export interface UseTrackingLogArgs {
  orgId?: number
  actorUserId?: number | string
  action?: string
  role?: string
  status?: string
  offset?: number
  limit?: number
  timeRange?: string
  search?: string
  initialFetch?: boolean
}

export interface UseTrackingLogReturn {
  trackingLogs: TrackingLogEntry[]
  loading: boolean
  error: unknown
  totalRows: number
  pagination: TrackingLogPagination
  refetch: (params?: Partial<UseTrackingLogArgs>) => Promise<void>
  fetchTrackingLog: (params?: Partial<UseTrackingLogArgs>) => Promise<void>
}



// useFetchGlobalCourses
export interface GlobalCourseInstructorDetails {
  name: string;
  profilePicture: string | null;
}

export interface GlobalCourseBatchInfo {
  id: number;
  name: string;
  bootcampId: number;
  instructorId: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  capEnrollment: number;
  createdAt: string;
  updatedAt: string;
  instructorDetails: GlobalCourseInstructorDetails;
}

export interface GlobalCourseEnrolledInfo {
  students_in_bootcamp: number;
  unassigned_students: number;
}

export interface GlobalCourseData {
  id: number;
  name: string;
  description: string;
  collaborator: string;
  coverImage: string;
  bootcampTopic: string;
  startTime: string;
  duration: number;
  language: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  version: string | null;
  bootcampId: number;
  type: string;
  isModuleLocked: boolean;
  batchInfo: GlobalCourseBatchInfo;
  enrolledInfo: GlobalCourseEnrolledInfo;
  courseOrgName?: string;
}

export interface GlobalCourseResponse {
  message?: string;
  code?: number;
  isSuccess?: boolean;
  data?: GlobalCourseData[]; // Array of courses
}

export interface UseFetchGlobalCoursesReturn {
  globalCourses: GlobalCourseData[]; // Changed to array
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


// useEnrollCourse
export interface EnrollCourseResponse {
  isSuccess?: boolean;
  status?: 'success' | 'error';
  message?: string;
  code?: number;
}

export interface EnrollCourseResult {
  success: boolean;
  message: string;
  code?: number;
}

export interface UseEnrollCourseReturn {
  enrollCourse: (bootcampId: number) => Promise<EnrollCourseResult>;
  isEnrolling: boolean;
  error: string | null;
}

// useSwitchOrg
export interface SwitchOrgPayload {
  orgId: number;
  refresh_token: string;
}

export interface SwitchOrgResponse {
  isSuccess?: boolean;
  status?: string;
  message?: string;
  access_token: string;
  refresh_token: string;
  user: {
    rolesList: any[];
    id: string;
    email: string;
    name: string;
    profilePicture?: string;
    profile_picture?: string;
    orgId: number;
    orgName: string;
  };
}

export interface SwitchOrgResult {
  success: boolean;
  message: string;
}

export interface UseSwitchOrgReturn {
  switchOrg: (payload: SwitchOrgPayload) => Promise<SwitchOrgResult>;
  isSwitching: boolean;
  error: string | null;
}