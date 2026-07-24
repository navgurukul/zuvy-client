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
