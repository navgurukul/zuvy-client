import { LevelId } from './constants';

export type { LevelId };

export interface Chapter {
  id: number;
  title: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  questionSetId?: number;
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

export type Band = 'easy' | 'medium' | 'hard';
export type BandCounts = Record<Band, number>;

export interface BuilderState {
  name: string;
  objective: string;
  outcomes: string;
  questionsPerForm: number;
  chapterIds: number[];
  poolTopics: { id: number; name: string }[];
  poolTopicDescriptions: Record<string, string>;
  poolTopicOutcomes: Record<string, string>;
  /** Questions per set, per topic and difficulty (keyed by topic name). */
  distribution: Record<string, BandCounts>;
  /** Topics + set size the distribution was proposed for; a change re-proposes it. */
  distributionKey: string;
  mode: 'formative' | 'summative';
  gateLevel: LevelId;
  timeLimit: string;
  proctorCopyPaste: boolean;
  proctorTabChange: boolean;
  status: 'editing' | 'draft' | 'published' | 'scheduled';
  scheduledDate: string;
  scheduledTime: string;
}
