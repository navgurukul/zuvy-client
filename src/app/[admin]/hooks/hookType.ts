import { AssessmentSubmissions } from "../organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType";
import { MentorAvailabilitySlot } from "@/hooks/useMentorAvailability";
import { VideoData } from "../organizations/[organizationId]/courses/[courseId]/(courseTabs)/submissions/components/courseSubmissionComponentType";

// useAllCourses
export interface coursePermissions {
  createCourse: boolean;
  viewCourse: boolean;
  editCourse: boolean;
  deleteCourse: boolean;
  viewContent: boolean;
  viewRolesAndPermissions: boolean;
};


// useAllUsers
export interface User {
    createdAt: any
    id: number
    roleId: number
    userId: number
    name: string
    email: string
    roleName: string
    isPoc?: boolean
    isZuvyPoc?: boolean
}

export interface UsersResponse {
    status: string
    message: string
    code: number
    data: User[]
    totalRows: number
    totalPages: number
    permissions?: {
        createUser: boolean
        viewUsers: boolean
        editUser: boolean
        deleteUser: boolean
    }
}


// useAssessmentDetailsOfQuiz
export interface QuizSubmissionData {
    id?: number;
    userId?: number;
    chosenOption?: number | null;
    attemptCount?: number;
    questionId?: number;
}

export interface QuizMcqDetail {
    id: number;
    quiz_id: number;
    assessmentOutsourseId: number;
    bootcampId: number;
    chapterId: number;
    correctOption: number;
    chosenOption: number;
    question: string;
    options: { [key: string]: string };
    variantId: string;
    createdAt: string;
    submissionsData: QuizSubmissionData;
}

export interface AssessmentDetailsOfQuizData {
    mcqs: QuizMcqDetail[];
}

export interface UseAssessmentDetailsOfQuizReturn {
    quizDetails: AssessmentDetailsOfQuizData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}


// useAssignBatch
export interface AssignBatchParams {
    bootcampId?: string | number
    batchId?: string | number
    students?: { name: string; email: string }[]
}


// useAssignmentSubmissions
export interface UseAssignmentSubmissionsOptions {
  searchAssignment?: string
  enabled?: boolean
}

export interface UseAssignmentSubmissionsResult {
  assignmentData: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
}


// useAssignPermissions
export interface AssignPermissionsPayload {
    resourceId: number
    roleId: number
    orgId: number
    permissions: Record<string | number, boolean>
}

export interface AssignPermissionsResponse<T = any> {
    status?: string
    message?: string
    code?: number
    data?: T
}


// useAssignUserRole
export interface AssignUserRolePayload {
    userId: number
    roleId: number
    orgId: number
}

export interface AssignUserRoleResponse {
    status?: string
    message?: string
    code?: number
    data?: any
}


// useBatchList
export type BatchListItem = {
    id: number | string
    name: string
}

export type BatchPermissions = {
    createBatch: boolean
    deleteBatch: boolean
    editBatch: boolean
    viewBatch: boolean
}


// useBatchReassign
export interface BatchReassignParams {
    userId?: string | number
    selectedValue?: string | number
    bootcampId?: string | number
}


// useBootcampAssessments
export interface BootcampAssessmentsResponse {
    totalStudents: number
    [moduleKey: string]: AssessmentSubmissions[] | number
}

export interface UseBootcampAssessmentsParams {
    courseId: string | number
    searchTerm?: string
}

export interface UseBootcampAssessmentsReturn {
    assessments: BootcampAssessmentsResponse | null
    loading: boolean
    error: string | null
    fetchAssessments: () => Promise<void>
    refetch: () => Promise<void>
}


// useBootcampDelete.tsx
export interface UseBootcampDeleteReturn {
  deleteBootcamp: (bootcampId: string) => Promise<void>
  isDeleting: boolean
  error: string | null
}


// useBootcampSettings.tsx
export interface BootcampSettingsData {
  type: string;
  isModuleLocked: boolean;
  mentorshipEnabled: boolean;
  leaderboardEnabled: boolean;
}

export interface UseBootcampSettingsReturn {
  bootcampSettings: BootcampSettingsData | null;
  loading: boolean;
  error: string | null;
  updateError: string | null; // Add this
  updateSettings: (settings: BootcampSettingsData) => Promise<void>;
  refetch: () => Promise<void>;
}


// useChapterStudents
export interface UseChapterStudentsOptions {
  searchStudent?: string
  limit?: number | string
  offset?: number | string
  batchId?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}


// useClassAnalytics
export interface ClassAnalyticsParams {
    classId: string | number
}


// useCodingQuesions
export interface UseCodingQuestionsProps {
    orgId: number | string
    selectedTopics?: Array<{ id?: number; value?: string }>
    selectedDifficulties?: string[]
    searchTerm?: string
    offset?: number
    position?: string | number
    initialFetch?: boolean
}


// useCompleteMentorSlotSession
export interface CompleteSessionResponse {
    message?: string
    completedAt?: string
    sessionLifecycleState?: string
    [key: string]: unknown
}


// useCreateClass
export type CreateClassData = {
    title: string
    batchId: number
    secondBatchId: number | null
    moduleId: number
    description?: string
    startDateTime: string
    endDateTime: string
    timeZone: string
    isZoomMeet: boolean
}

export type CreateClassResponse = {
    status: string
    message: string
    data?: any
}


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


// useCreateMentorSlot
export interface CreateMentorSlotPayload {
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
}

export type CreateMentorSlotApiResponse =
    | MentorAvailabilitySlot
    | { data: MentorAvailabilitySlot }
    | {
          data?: MentorAvailabilitySlot | MentorAvailabilitySlot[]
          slot?: MentorAvailabilitySlot
      }

export interface CreateMentorSlotResult {
    success: boolean
    slot: MentorAvailabilitySlot | null
    errorMessage?: string
    statusCode?: number
}


// useCreateModule
export type CreateModulePayload = {
  name: string
  description: string
  timeAlloted: number
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


// useCreateOrganization
export interface CreateOrganizationPayload {
    title: string
    displayName: string
    logoUrl: string
    pocName: string
    pocEmail: string
    isManagedByZuvy: boolean
    zuvyPocName: string | null
    zuvyPocEmail: string | null
}

export interface CreateOrganizationResponse {
    status: string
    message: string
    [key: string]: any
}


// useCreateTopic
export type CreateTopicPayload = {
    moduleId: number
    name: string
    description: string
}

export type CreateTopicResponse = {
    id?: number
    name?: string
    description?: string
    message?: string
    [key: string]: unknown
}


// useDeleteModule
export interface DeleteModuleParams {
    courseId: string | number
    moduleId: string | number
}


// useDeleteStudent
export interface DeleteStudentOptions {
    onSuccess?: (resData: any) => void
    onError?: (err: any) => void
}


// useDeleteUser
export type DeleteUserResponse = {
    message?: string
    [key: string]: unknown
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


// useEditQuizQuestions
export type EditQuizPayload = {
    id: number
    title: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    tagId: number
    content: string
    isRandomOptions: boolean
    variantMCQs: Array<{
        variantNumber: number
        question: string
        options: Record<number, string>
        correctOption: number
    }>
}


// useGenerateAiAssessment
export type GenerateAiAssessmentPayload = {
    bootcampId: number
    scope: 'domain'
    chapterId: number
    domainId: number
    title: string
    description: string
    audience: string
    totalNumberOfQuestions: number
}

export type AiAssessmentData = {
    id: number
    bootcampId: number
    scope: string
    domainId: number
    title: string
    description: string
    audience: string
    totalNumberOfQuestions: number
    totalQuestionsWithBuffer?: number
    startDatetime?: string | null
    endDatetime?: string | null
    publishedAt?: string | null
    createdAt?: string
    updatedAt?: string
    [key: string]: unknown
}

export type GenerateAiAssessmentResponse = {
    message: string
    data: AiAssessmentData
    totalAssignedStudents?: number
    [key: string]: unknown
}

export type MapQuestionsPayload = {
    aiAssessmentId: number
}

export type MapQuestionsResponse = {
    aiAssessmentId: number
    isBaseline: boolean
    setsCreated: number
    totalQuestionsPerSet: number
    commonPerSet: number
    uniquePerSet: number
    message?: string
    [key: string]: unknown
}

export type GenerateAndMapAssessmentResponse = {
    createResponse: GenerateAiAssessmentResponse
    mapResponse: MapQuestionsResponse
}

export type AiGenerationPhase =
    | 'idle'
    | 'creating-assessment'
    | 'mapping-questions'



// useGetAiAssessment
export type AiAssessmentSummary = {
  id: number
  bootcampId: number
  chapterId: number
  scope: string
  domainId: number
  title: string
  description: string
  audience: string
  totalNumberOfQuestions: number
  totalQuestionsWithBuffer?: number
  startDatetime: string | null
  endDatetime: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}


// useGetChapterDetails
export type ChapterDetailsParams = {
  chapterId: string | number
  bootcampId?: string | number
  moduleId?: string | number
  topicId?: string | number
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


// useGetMentorProfile
export interface MentorProfileResponse {
  mentorProfileId: number
  mentorUserId: string
  organizationId: number
  mentorType: string
  timezone: string
  title: string
  bio: string
  expertise: string[]
  pastExperiences: string | null
  status: string
  isVerified: boolean
  acceptsNewMentees: boolean
  createdAt: string
  updatedAt: string
}

export interface ProfileCompletenessGate {
  isComplete: boolean
  missingFields: string[]
  completionPercentage: number
}


// useGetQuestionSets
export interface QuestionOption {
  [key: string]: string
}

export interface Question {
  position: number
  isCommon: boolean
  questionId: number
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  options: QuestionOption
  correctOption: number
  levelId: string
  domainName: string
  topicName: string
  topicDescription: string
}

export interface QuestionSet {
  id: number
  setIndex: number
  label: string
  levelCode: string
  status: string
  questions: Question[]
}

export interface GetQuestionSetsResponse {
  aiAssessmentId: number
  bootcampId: number
  title: string
  description: string
  totalNumberOfQuestions: number
  scope: string
  publishedAt: string | null
  isPublished: boolean
  setCount: number
  sets: QuestionSet[]
}


// useLiveClassSubmissions
export interface UseLiveClassSubmissionsOptions {
  searchTerm?: string
  enabled?: boolean
}

export interface UseLiveClassSubmissionsResult {
  liveClassData: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
}


// useMarkMentorSlotAttendance
export interface MarkMentorAttendancePayload {
    joinedAt: string
    leftAt: string
}

export interface MarkAttendanceResponse {
    message?: string
    joinedAt?: string
    leftAt?: string
    durationAttended?: number
    [key: string]: unknown
}


// useMentorMetrics
export interface SessionMetrics {
    total: string | number
    completed: string | number
    cancelled: string | number
    missed: string | number
    completionRate: string | number
    cancellationRate: string | number
}

export interface RatingMetrics {
    averageRating: string | number
    totalRatings: string | number
}

export interface UtilizationMetrics {
    totalSlots: string | number
    usedSlots: string | number
    utilizationRate: string | number
}

export interface MentorMetrics {
    sessions: SessionMetrics
    ratings: RatingMetrics
    upcomingSessions: string | number
    utilization: UtilizationMetrics
}


// useMentorSlotDetails
export interface MentorSlotDetailsSlot {
    id: number
    slotStartDateTime: string
    slotEndDateTime?: string
    [key: string]: unknown
}

export interface MentorSlotDetailsBooking {
    id: number
    studentUserId: number
    status: string
    mentorFeedback?: {
        notes?: string | null
        areasOfImprovement?: string | null
    } | null
    mentorRating?: number | null
    mentorFeedbackSubmittedAt?: string | null
    mentorFeedbackLocked?: boolean | null
    studentRating?: number | null
    studentFeedback?: string | null
    studentFeedbackSubmittedAt?: string | null
    studentFeedbackLocked?: boolean | null
    cancelledAt?: string | null
    cancellationReason?: string | null
    cancelledBy?: string | null
    [key: string]: unknown
}

export interface MentorSlotDetailsData {
    slot: MentorSlotDetailsSlot | null
    bookings: MentorSlotDetailsBooking[]
}


// useMyMentorSlots
export interface MentorCreatedSlot {
    id: number
    mentorSlotManagementId: number
    slotStartDateTime: string
    slotEndDateTime: string
    durationMinutes: number
    maxCapacity: number
    currentBookedCount: number
    status: string
}

export interface MentorSlotMetrics {
    totalSlots: number
    available: number
    full: number
    completed: number
    closed: number
    hours: number
}


// useNotifications
export interface Notification {
    id: number
    type: string
    title: string
    message: string
    isRead: boolean
    createdAt: string
}


// useOpenEndedQuestions
export interface UseOpenEndedQuestionsProps {
    orgId: number | string
    selectedTopics?: Array<{ id?: number; value?: string }>
    selectedDifficulties?: string[]
    searchTerm?: string
    offset?: number
    position?: string | number
    initialFetch?: boolean
}

export interface FetchedData {
    data: any[]
    totalRows?: number
    totalPages?: number
    error?: any
}


// useOpenEndedSolutionForStudents
export interface OpenEndedQuestionDetail {
  id: number;
  question: string;
  difficulty: string;
}

export interface OpenEndedSubmissionData {
  id: number;
  openEndedQuestionId: number;
  assessmentSubmissionId: number;
  answer: string;
  OpenEndedQuestion: OpenEndedQuestionDetail;
}

export interface UseOpenEndedSolutionForStudentsReturn {
  data: OpenEndedSubmissionData[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}


// useOverallAnalysis
export type OverallAnalysisStudent = {
    id?: number | string
    userId?: number | string
    name?: string
    email?: string
    overAllAttendance?: number | null
    numberOfAssessmentsAttempted?: number
    averageAssessmentPercentage?: number | null
    assessments?: unknown[]
    oneOnOneSessionsCompleted?: number
    profile?: unknown
}

export type OverallAnalysisPayload = {
    courseName?: string
    batchName?: string
    students?: OverallAnalysisStudent[]
}

export type UseOverallAnalysisArgs = {
    batchId?: number | string
    userId?: number | string
    auto?: boolean
}


// usePracticeProblemStatus
export interface UsePracticeProblemStatusOptions {
  chapterId?: string | number
  questionId?: string | number
  searchStudent?: string
  batchId?: string
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  enabled?: boolean
}

export interface UsePracticeProblemStatusResult {
  studentDetails: any[]
  loading: boolean
  error: Error | null
  refetch: () => void
  fetchStatus: (customParams?: Partial<UsePracticeProblemStatusOptions>) => Promise<any>
}


// usePracticeProblemSubmissions
export interface UsePracticeProblemSubmissionsOptions {
  searchPractiseProblem?: string
  enabled?: boolean
}

export interface UsePracticeProblemSubmissionsResult {
  trackingData: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
  fetchSubmissions: (searchQuery?: string) => Promise<any>
}


// useProjectSubmissions
export interface UseProjectSubmissionsOptions {
  searchProject?: string
  enabled?: boolean
}

export interface UseProjectSubmissionsResult {
  rawResponse: any
  bootcampModules: any[]
  totalStudents: number
  loading: boolean
  error: Error | null
  refetch: () => void
}


// useQuizQuestions
export interface UseQuizQuestionsProps {
    orgId: number | string
    selectedTopics?: Array<{ id?: number; value?: string }>
    selectedDifficulties?: string[]
    searchTerm?: string
    initialFetch?: boolean
}

export interface UseQuizQuestionsReturn {
    quizQuestions: any[]
    loading: boolean
    error: any
    fetchQuizQuestions: (opts?: {
        topics?: Array<{ id?: number; value?: string }>
        difficulties?: string[]
        search?: string
    }) => Promise<{ data: any[]; error?: any }>
    refetch: () => Promise<{ data: any[]; error?: any }>
}


// useRbacPermissions
export interface PermissionsResponse {
    status?: string
    message?: string
    code?: number
    data?: Array<{ id: number; name: string }>
}


// useRbacResources
export interface RbacResource {
    id: number
    title: string
    description: string
    permissions: string[]
}

export interface RawRbacResource {
    id?: number
    name?: string
    title?: string
    description?: string
    permissions?: string[]
    actions?: string[]
    resource?: string
}

export interface RbacResourcesResponse {
    status?: string
    message?: string
    code?: number
    data?: RawRbacResource[]
}


// useRoles
export interface Role {
    id: number
    name: string
    description: string
}

export interface RolesResponse {
    status: string
    message: string
    code: number
    data: Role[]
}


// useStudentMentorFeedbacks
export interface StudentFeedbackEntry {
    id: number
    bookingId: number
    studentName?: string | null
    studentUserName?: string | null
    studentFullName?: string | null
    learnerName?: string | null
    rating?: number
    studentRating?: number
    feedback?: string | null
    notes?: string | null
    createdAt?: string | null
    submittedAt?: string | null
    date?: string | null
}


// useSubmitMentorSlotFeedback
export interface MentorSessionFeedbackPayload {
    feedback: {
        notes: string
        areasOfImprovement: string
    }
    rating: number
}

export interface SubmitFeedbackResponse {
    message?: string
    feedbackLockedAt?: string
    rating?: number
    [key: string]: unknown
}


// useTrackingLog
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
  updateState?: boolean
}

export interface UseTrackingLogReturn {
  trackingLogs: TrackingLogEntry[]
  loading: boolean
  error: unknown
  totalRows: number
  pagination: TrackingLogPagination
  refetch: (params?: Partial<UseTrackingLogArgs>) => Promise<void>
  fetchTrackingLog: (params?: Partial<UseTrackingLogArgs>) => Promise<TrackingLogEntry[]>
}

export interface TrackingLogFetchResult {
    logs: TrackingLogEntry[]
    pagination: {
        offset: number
        limit: number
        total: number
    }
}


// useUpdateOpenEndedQuestion
export type UpdateOpenEndedQuestionData = CreateOpenEndedQuestionData;

export interface UseUpdateOpenEndedQuestionReturn {
  updateOpenEndedQuestion: (questionId: number, data: UpdateOpenEndedQuestionData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}


// useUpdateStudent
export interface UpdateStudentPayload {
    email: string
    name: string
    status: string
    batchId: number
}

export interface UpdateStudentOptions {
    onSuccess?: (resData: any) => void
    onError?: (err: any) => void
}


// useVideoSubmissions
export interface UseVideoSubmissionsOptions {
  searchAssessment?: string
  enabled?: boolean
}

export interface UseVideoSubmissionsResult {
  videoData: VideoData | null
  loading: boolean
  error: Error | null
  refetch: () => void
}