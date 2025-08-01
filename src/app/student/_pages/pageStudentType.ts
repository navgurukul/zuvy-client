// CourseDashboard
export interface ModuleContentCounts {
  quizCount: number;
  assignmentCount: number;
  codingProblemsCount: number;
  articlesCount: number;
  formCount: number;
}

// ModuleContentPage
export interface TopicItem {
  id: string;
  title: string;
  type: string;
  status: string;
  description?: string;
  duration?: string;
  scheduledDateTime?: Date;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  items: TopicItem[];
}

export interface Module {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  modules: Module[];
}



// ProjectPage
export interface ProjectState {
  submissionLink: string;
  isSubmitted: boolean;
  submittedAt?: Date;
  validationError?: string;
}
export interface TextContentItem {
  type: 'text';
  text: string;
}

export interface ParagraphContentItem {
  type: 'paragraph';
  content: TextContentItem[];
}



// StudentDashboard
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
  moduleId?: number;
  chapterId?: number;
  hangoutLink?: string;
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
  instructorDetails: {
    id: number;
    name: string;
    profilePicture: string | null;
  };
  upcomingEvents: UpcomingEvent[];
}
