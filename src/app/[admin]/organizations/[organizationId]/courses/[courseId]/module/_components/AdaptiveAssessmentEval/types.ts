import { LevelId } from './constants';

export type { LevelId };

export interface Chapter {
  id: number;
  title: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  qtype: string;
  topic: string;
  difficulty: string;
  quarantined?: boolean;
  text: string;
  source: 'ai' | 'bank';
  validated?: boolean;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export interface BuilderState {
  name: string;
  objective: string;
  outcomes: string;
  questionsPerForm: number;
  chapterIds: number[];
  poolTopics: { id: number; name: string }[];
  poolTopicDescriptions: Record<string, string>;
  poolTopicOutcomes: Record<string, string>;
  mode: 'formative' | 'summative';
  gateLevel: LevelId;
  timeLimit: string;
  proctorCopyPaste: boolean;
  proctorTabChange: boolean;
  status: 'editing' | 'draft' | 'published' | 'scheduled';
  scheduledDate: string;
  scheduledTime: string;
}
