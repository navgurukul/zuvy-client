import { AssessmentSubmissionResponse } from "../course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType";
import { AssessmentData } from "../course/[courseId]/org/[orgId]/studentAssessment/_studentAssessmentComponents/projectStudentAssessmentUtilsType";


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


// useAssessmentOpenEndedQuestions
export interface UseAssessmentOpenEndedQuestionsReturn {
  openEndedQuestions: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


// useAssessmentQuizQuestions
export interface UseAssessmentQuizQuestionsReturn {
  quizQuestions: any;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


// useAssessmentSubmissions
export interface UseAssessmentSubmissionsParams {
  assessmentId: number | null;
  moduleId: string;
  bootcampId: string;
  chapterId: string;
}

export interface UseAssessmentSubmissionsReturn {
  submissionsData: AssessmentSubmissionResponse | null;
  loading: boolean;
  error: string | null;
  fetchSubmissions: () => Promise<AssessmentSubmissionResponse | null>;
}


// UseAssignmentDetails
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


// useBookMentorSlot
export interface MentorSlotBooking {
    id: number
    slotAvailabilityId: number
    studentUserId: number
    mentorUserId: number
    organizationId: number
    status: string
    sessionLifecycleState: string
    bookedAt: string
    confirmedAt: string
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


// useCodingChallenge
export interface UseCodingChallengeProps {
  questionId: string;
  onChapterComplete?: () => void;
  orgId?: string | null;
}


// useCodingSubmissions
export interface CodingSubmissionsResponseData {
  action: string | null;
  languageId: number;
  sourceCode: string;
  TestCasesSubmission: any[];
}

export interface CodingSubmissionsResponse {
  status?: string;
  message?: string;
  data?: CodingSubmissionsResponseData;
}

export interface UseCodingSubmissionsParams {
  codingOutsourseId: number | null;
  assessmentSubmissionId: number | null;
  questionId: number | null;
  enabled?: boolean;
}


// useCodingSubmissionsByQuestion
export interface CodingSubmissionByQuestionData {
  questionId: number;
  sourceCode: string;
  programLangId: string;
  action: string;
  status: string;
  questionDetail: {
    title: string;
    description: string;
    difficulty: string;
  };
  createdAt: string;
  TestCasesSubmission: Array<{
    status: string;
    [key: string]: any;
  }>;
}

export interface UseCodingSubmissionsByQuestionParams {
  questionId: number | null;
  enabled?: boolean;
}

export interface UseCodingSubmissionsByQuestionReturn {
  submissionData: CodingSubmissionByQuestionData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


// useCollegeSearch
export interface CollegeOption {
  name: string;
  state: string;
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


// useGetCodingQuestion
export interface CodingQuestionDetails {
    title: string;
    description: string;
    constraints?: string;
    examples?: { input: number[]; output: number };
    testCases?: any[];
    templates?: Record<string, { template: string }>;
}

export interface UseGetCodingQuestionParams {
    questionId: string | null;
    orgId: string | string[] | null;
    enabled?: boolean;
}

export interface UseGetCodingQuestionReturn {
    questionDetails: CodingQuestionDetails | null;
    testCases: any[];
    templates: Record<string, { template: string }>;
    examples: any[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}


// useGetRescheduleSlots
export interface RescheduleSlot {
    id: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    topic: string | null
    status: string
}


// useLearnerBoards
export interface LearnerBoard {
    id?: number | string
    name: string
    [key: string]: any
}

export interface LearnerBoardsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        boards?: LearnerBoard[]
    } | LearnerBoard[] | string[]
}


// useLearnerBranchDetails
export interface LearnerBranchDetail {
    id?: number | string
    name: string
    [key: string]: any
}

export interface LearnerBranchDetailsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        degrees?: LearnerDegreeDetail[]
        branches?: LearnerBranchDetail[] | string[]
    } | LearnerDegreeDetail[] | LearnerBranchDetail[] | string[]
}


// useLearnerDegreeDetails
export interface LearnerDegreeDetail {
    id?: number | string
    name: string
    branches?: string[]
    [key: string]: any
}

export interface LearnerDegreeDetailsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        degrees?: LearnerDegreeDetail[]
    } | LearnerDegreeDetail[] | string[]
}


// useLearnerProfile
export interface LearnerProfileProject {
    githubUrl: any
    demoUrl: any
    title: string
    description: string
    techStack?: string[]
}

export interface LearnerWorkExperience {
    [key: string]: unknown
}

export interface LearnerProfileData {
    id: number
    userId: number
    fullName: string | null
    phoneNumber: string | null
    email: string | null
    linkedinProfile: string | null
    collegeName: string | null
    otherCollegeName: string | null
    degree: string | null
    branch: string | null
    yearOfStudy: string | null
    graduationMonth: string | null
    graduationYear: string | null
    currentStatus: string | null
    technicalSkills: string[]
    projects: LearnerProfileProject[]
    collegeStream: string | null
    collegeScore: string | number | null
    collegeScoreType: string | null
    class12Board: string | null
    class12Score: string | number | null
    class12ScoreType: string | null
    class10Board: string | null
    class10Score: string | number | null
    class10ScoreType: string | null
    hasWorkExperience: boolean
    workExperiences: LearnerWorkExperience[]
    leetcodeProfiles: string[]
    codechefProfiles: string[]
    codeforcesProfiles: string[]
    targetRoles: string[]
    preferredLocations: string[]
    openToRemote: boolean
    internshipStipend: string | number | null
    fullTimeCtc: string | number | null
    preferredContactMethods: string[]
    resumeUrl: string | null
    originalFilename: string | null
    createdAt: string
    updatedAt: string
}

export interface LearnerProfileResponse {
    success: boolean
    data: LearnerProfileData
}


// useLearnerRemoteLocations
export interface LearnerRemoteLocation {
    id?: number | string
    name: string
    [key: string]: any
}

export interface LearnerRemoteLocationsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        remoteLocations?: LearnerRemoteLocation[]
    } | LearnerRemoteLocation[] | string[]
}


// useLearnerRoles
export interface LearnerRole {
    id?: number | string
    name: string
    [key: string]: any
}

export interface LearnerRolesResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        roles?: LearnerRole[]
    } | LearnerRole[] | string[]
}


// useLearnerTechnicalSkills
export interface LearnerTechnicalSkill {
    id?: number | string
    name: string
    [key: string]: any
}

export interface LearnerTechnicalSkillsResponse {
    status?: string
    message?: string
    code?: number
    data?: {
        skills?: LearnerTechnicalSkill[]
    } | LearnerTechnicalSkill[] | string[]
}


// useMentorProfile
export interface MentorProfile {
    mentorUserId: number
    name?: string
    bio: string
    expertise: string[]
    title: string
    bufferMinutes: number
    timezone: string
    acceptsNewMentees: boolean
    status: string
    pastExperiences?: string 
}


// useMentors
export interface Mentor {
    userId: string
    name: string
    email: string
    role: string | null
    bio: string | null
    pastExperiences?: string | null
    expertise: string[] | null
    title: string | null
    availabilityStatus:string | null
    availableSlots:number
    organizationId?: number
    orgName?: string | null
}

export interface MentorsPaginatedResponse {
    limit: number
    offset: number
    total: number
    hasMore: boolean
    data: Mentor[]
}

export type MentorsApiResponse = Mentor[] | { data?: Mentor[] } | MentorsPaginatedResponse

export interface ParsedMentorsResponse {
    data: Mentor[]
    limit: number
    offset: number
    total: number
    hasMore: boolean
}

export interface GetMentorsParams {
    searchTerm?: string
    limit?: number
    offset?: number
    organizationId?: string | number
}


// useOpenEndedSubmission
export interface OpenEndedAnswerDto {
  questionId: number;
  answer: string;
}

export interface OpenEndedSubmissionPayload {
  openEndedQuestionSubmissionDto: OpenEndedAnswerDto[];
}

export interface OpenEndedSubmissionResponse {
  status?: string;
  message?: string;
  data?: any;
}

export interface UseOpenEndedSubmissionReturn {
  submitOpenEnded: (payload: OpenEndedSubmissionPayload) => Promise<OpenEndedSubmissionResponse | null>;
  isSubmitting: boolean;
  error: string | null;
}


// useParsedResume
export interface ParsedResumeData {
    name: string
    email: string
    phone: string
    linkedin: string
    github: string
    skills: string[]
    education: string[]
    projects: any[]
    [key: string]: any
}

export interface ParsedResumeResponse {
    success?: boolean
    resumeUrl?: string
    originalFilename?: string
    data?: ParsedResumeData
    [key: string]: any
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


// useQuizAndAssignmentWithStatus
export interface CodingProblem {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  tagName?: string;
  status: string;
}

export interface QuizAndAssignmentWithStatusData {
  codingProblem: CodingProblem[];
  [key: string]: any;
}

export interface UseQuizAndAssignmentWithStatusParams {
  chapterId: number | null;
  enabled?: boolean;
}

export interface UseQuizAndAssignmentWithStatusReturn {
  codingProblems: CodingProblem[];
  data: QuizAndAssignmentWithStatusData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
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


// useQuizSubmission
export interface QuizAnswerDto {
  questionId: number;
  variantId: number;
  attemptCount: number;
  chosenOption: number;
}

export interface QuizSubmissionPayload {
  quizSubmissionDto: QuizAnswerDto[];
}

export interface QuizSubmissionResponse {
  status?: string;
  message?: string;
  data?: any;
}

export interface UseQuizSubmissionReturn {
  submitQuiz: (payload: QuizSubmissionPayload) => Promise<QuizSubmissionResponse | null>;
  isSubmitting: boolean;
  error: string | null;
}


// useRequestReattempt
export interface UseRequestReattemptReturn {
  requestReattempt: (submissionId: number | string, userId: number | string) => Promise<void>;
  isRequesting: boolean;
  error: string | null;
}


// useSaveLearnerProfile
export interface LearnerProfilePayload {
    [key: string]: any
}


// useStartAssessment
export interface StartAssessmentResponse {
  data: AssessmentData & {
    submission: {
      id: number;
      startedAt: string;
    };
  };
}

export interface UseStartAssessmentReturn {
  assessmentData: (AssessmentData & { submission: { id: number; startedAt: string } }) | null;
  loading: boolean;
  error: string | null;
  startAssessment: (
    assessmentOutSourceId: number,
    isNewStart?: boolean
  ) => Promise<(AssessmentData & { submission: { id: number; startedAt: string } }) | null>;
}


// useStudentMentorMetrics
export interface StudentMentorMetrics {
    id: number
    userId: string | number
    totalBookings: number
    quotaUsed: number
    lastBookingDate: string | null
    quotaResetDate: string | null
    cooldownEndDate: string | null
    isQuotaExhausted: boolean
    createdAt: string
    updatedAt: string
    remainingCredits: number
    canBook: boolean
    nextEligible: string | null
}


// useSubmitAssessment
export interface SubmitAssessmentPayload {
  tabChange: number;
  copyPaste: number;
  fullScreenExit: number;
  eyeMomentCount: number;
  typeOfsubmission: 'studentSubmit' | 'auto-submit';
}

export interface UseSubmitAssessmentReturn {
  loading: boolean;
  error: string | null;
  submitAssessment: (
    assessmentSubmissionId: number,
    payload: SubmitAssessmentPayload
  ) => Promise<boolean>;
}


// useSubmitQuizAndAssignment
export interface SubmitAssignmentPayload {
  submitAssignment: {
    projectUrl: string;
    timeLimit: string;
  };
}

export interface SubmitQuizAnswer {
  mcqId: number;
  chossenOption: number;
}

export interface SubmitQuizPayload {
  submitQuiz: SubmitQuizAnswer[];
}

export interface UseSubmitQuizAndAssignmentParams {
  courseId: string;
  moduleId: string;
  chapterId: string | number;
  onSuccess?: () => void;
}

export interface UseSubmitQuizAndAssignmentReturn {
  submitAssignment: (payload: SubmitAssignmentPayload) => Promise<void>;
  submitQuiz: (payload: SubmitQuizPayload) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}


// useSubmitStudentFeedback
export interface StudentFeedbackPayload {
    rating: number
    feedback: string
    notes: string
}

export interface SubmitFeedbackResponse {
    message?: string
    [key: string]: unknown
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

export interface MentorSessionEvent {
  type: "Mentor Session";
  id: number;
  mentorName: string;
  title: string;
  startTime: string;
  endTime: string;
  sessionStatus: string;
  bookingStatus: string;
  meetingLink: string | null;
  meetingType: string;
  slotType: string;
  eventDate: string;
}

export interface UpcomingEventsData {
  events: Event[];
  mentorSessions?: MentorSessionEvent[];
  totalEvents: number;
  totalPages: number;
}
export interface UseUpcomingEventsReturn {
  upcomingEventsData: UpcomingEventsData | null;
  loading: boolean;
  error: string | null;
}

export interface CompletedClassesResponse {
  data: any;
  message: string;
  isSuccess: boolean;
}


// useUpdateLearnerProfile
export interface UpdateLearnerProfilePayload {
    [key: string]: any
}

