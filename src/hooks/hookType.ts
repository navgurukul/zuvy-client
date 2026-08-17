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



// UseChapterDetails
export interface LiveClassSession {
  id: number;
  meetingId: string;
  hangoutLink: string;
  startTime: string;
  endTime: string;
  title: string;
  s3link: string;
  status: string;          // 'upcoming' | 'ongoing' | 'completed'
  attendance: string;      // 'present' | 'absent'
  duration: number;
  batchId?: number;        // which batch this session belongs to
}

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
  sessions?: LiveClassSession[];  // present when topicId === 8 (live class)
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
  fetchCompletedClasses: (courseId: string | number, studentId: string | number) => Promise<any>;
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
  mentorshipEnabled?: boolean;
  leaderboardEnabled: boolean;
}

export interface LatestUpdatedCourseResponse {
  message: string;
  code: number;
  isSuccess: boolean;
  mentorshipEnabled: boolean;
  leaderboardEnabled: boolean;
  data: LatestUpdatedCourseData;
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
  organizationId: number;
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
  user?: {
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

export interface UseSwitchOrgReturn {
  switchOrg: (payload: SwitchOrgPayload) => Promise<SwitchOrgResult>;
  isSwitching: boolean;
  error: string | null;
}



// usePracticeCodeSubmit
export interface PracticeCodeSubmitPayload {
  languageId: number;
  sourceCode: string;
}

export interface PracticeCodeTestCaseResult {
  status: string;
  stdout?: string;
  stdOut?: string;
  stderr?: string;
  stdErr?: string;
  stdIn?: any;
  expectedOutput?: any;
  compileOutput?: any;
  testCases?: any;
  memory?: string;
  time?: string;
  [key: string]: any;
}

export interface PracticeCodeSubmitResponse {
  status?: string;
  message?: string;
  data: PracticeCodeTestCaseResult[];
}

export interface UsePracticeCodeSubmitParams {
  questionId: string | null;
  assessmentSubmitId: number | null | undefined;
  selectedCodingOutsourseId: number | null | undefined;
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


export interface TopicSubtopic {
  [key: string]: string;
}

export interface Topic {
  id: number;
  orgId: string;
  name: string;
  description: string;
  subtopic: TopicSubtopic;
  createdAt: string;
  updatedAt: string;
}

export type TopicListResponse = Topic[];

export interface NewTopicSubtopicMap {
  [key: string]: string;
}

export interface CreatedTopic {
  id: number;
  orgId: string;
  name: string;
  description: string;
  subtopic: NewTopicSubtopicMap | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicRequestBody {
  name: string;
  description: string;
  subtopic: NewTopicSubtopicMap;
}

export type CreateTopicApiResponse = CreatedTopic;

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface QuestionCounts {
  easy: number;
  medium: number;
  hard: number;
}

export interface TopicConfiguration {
  topicName: string;
  topicDescription: string;
  subtopics: string[];
  totalQuestions: number;
  questionCounts: QuestionCounts;
}

export interface TopicsMap {
  [topicName: string]: number;
}

export interface GenerateQuestionsRequestBody {
  // domainName: string;
  topicName: string;
  topicDescription: string;
  subtopics: string[];
  numberOfQuestions: number;
  learningObjectives: string;
  targetAudience: string;
  focusAreas: string;
  bloomsLevel: string;
  questionStyle: string;
  difficultyDistribution: DifficultyDistribution;
  questionCounts: QuestionCounts;
  topics: TopicsMap;
  topicConfigurations: TopicConfiguration[];
  levelId: number | null;
}

export type GenerateQuestionsApiResponse = GenerateQuestionsRequestBody;


export interface AddSubtopicRequestBody {
  subtopic: string;
}

export interface SubtopicMap {
  [key: string]: string;
}

export interface TopicWithSubtopics {
  id: number;
  orgId: string;
  name: string;
  description: string;
  subtopic: SubtopicMap | null;
  createdAt: string;
  updatedAt: string;
}

export type AddSubtopicApiResponse = TopicWithSubtopics;


// types/aiAssessment.ts

export interface PoolTopic {
  id: number;
  name: string;
}

export interface CreateAiAssessmentPayload {
  bootcampId: number;
  chapterId: number;
  title: string;
  objective: string;
  description: string;
  audience: string;
  expectedOutcomes: string;
  totalNumberOfQuestions: number;
  chapterIds: number[];
  moduleId: number;
  poolTopics: PoolTopic[];
  startDatetime: string; // ISO 8601 string, e.g. "2026-04-10T09:00:00+05:30"
  endDatetime: string;   // ISO 8601 string
}

// Adjust to match your actual API response shape
export interface CreateAiAssessmentResponse {
  id: number;
  bootcampId: number;
  chapterId: number;
  title: string;
  status: string;
  createdAt: string;
}

// types/topic.ts

export interface DifficultyLevel {
  easy: number;
  medium: number;
  hard: number;
}

export interface TopicWithDifficultyLevel {
  id: number;
  name: string;
  difficultyLevel: DifficultyLevel;
}

// types/aiAssessment.ts

export interface PoolTopic {
  id: number;
  name: string;
}

export interface CreateAiAssessmentPayload {
  bootcampId: number;
  chapterId: number;
  title: string;
  objective: string;
  description: string;
  audience: string;
  expectedOutcomes: string;
  totalNumberOfQuestions: number;
  chapterIds: number[];
  moduleId: number;
  poolTopics: PoolTopic[];
}

// Adjust to match your actual API response shape
export interface CreateAiAssessmentResponse {
  id: number;
  bootcampId: number;
  chapterId: number;
  title: string;
  status: string;
  createdAt: string;
}

export interface MapQuestionsRequestBody {
    aiAssessmentId: number;
}

export interface MapQuestionsApiResponse {
    success: boolean;
    message?: string;
    // add actual response fields once you confirm the API shape
}

export interface QuestionOption {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
}

export interface AiAssessmentQuestion {
    position: number;
    isCommon: boolean;
    questionId: number;
    question: string;
    difficulty: "easy" | "medium" | "hard";
    language: string;
    options: QuestionOption;
    correctOption: number;
    levelId: string;
    topicName: string;
    topicDescription: string;
}

export interface AiAssessmentSet {
    id: number;
    setIndex: number;
    label: string;
    levelCode: string;
    status: string;
    questions: AiAssessmentQuestion[];
}

export interface GetQuestionSetsApiResponse {
    aiAssessmentId: number;
    bootcampId: number;
    title: string;
    description: string | null;
    totalNumberOfQuestions: number;
    scope: string;
    status: string;
    publishedAt: string | null;
    isPublished: boolean;
    setCount: number;
    sets: AiAssessmentSet[];
}

export interface PublishAssessmentRequestBody {
    endDatetime: string;
}

export interface PublishAssessmentApiResponse {
    success: boolean;
    message?: string;
    // add actual response fields once you confirm the API shape
}

export interface PoolTopic {
    id: number;
    name: string;
}

export interface AiAssessmentByChapter {
    id: number;
    bootcampId: number;
    chapterId: number;
    scope: string;
    status: string;
    moduleId: number;
    title: string;
    description: string | null;
    objective: string;
    expectedOutcomes: string;
    audience: string | null;
    chapterIds: number[];
    poolTopics: PoolTopic[];
    totalNumberOfQuestions: number;
    totalQuestionsWithBuffer: number;
    startDatetime: string | null;
    endDatetime: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export type GetAiAssessmentsByChapterApiResponse = AiAssessmentByChapter[];