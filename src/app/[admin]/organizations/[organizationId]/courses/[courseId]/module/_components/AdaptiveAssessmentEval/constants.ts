export type LevelId = 'E' | 'D' | 'C' | 'B' | 'A' | 'A+';

export const THEME = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  shadowSoft: '0 1px 3px rgba(0,0,0,0.1)',
  shadowStrong: '0 4px 6px rgba(0,0,0,0.1)',
  text: '#0f172a',
  textSub: '#475569',
  textTertiary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#0ea5e9',
  primaryDark: '#0284c7',
  primaryMid: '#38bdf8',
  primaryLight: '#e0f2fe',
  secondary: '#8b5cf6',
  secondaryDark: '#6d28d9',
  secondaryLight: '#ede9fe',
  danger: '#ef4444',
  dangerDark: '#b91c1c',
  dangerLight: '#fee2e2',
  success: '#22c55e',
  successDark: '#15803d',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningDark: '#b45309',
  warningLight: '#fef3c7',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  muted: '#f1f5f9',
};

export const DIFF_BG: Record<string, string> = {
  easy: '#dcfce7',
  medium: '#fef3c7',
  hard: '#fee2e2',
};

export const DIFF_COLOR: Record<string, string> = {
  easy: '#166534',
  medium: '#92400e',
  hard: '#991b1b',
};

export const DIFF_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const LEVELS = [
  { id: 'E' as LevelId, label: 'Level E', mix: [70, 30, 0] },
  { id: 'D' as LevelId, label: 'Level D', mix: [50, 40, 10] },
  { id: 'C' as LevelId, label: 'Level C', mix: [30, 50, 20] },
  { id: 'B' as LevelId, label: 'Level B', mix: [10, 60, 30] },
  { id: 'A' as LevelId, label: 'Level A', mix: [0, 40, 60] },
  { id: 'A+' as LevelId, label: 'Level A+', mix: [0, 10, 90] },
];

export const BANDS = ['easy', 'medium', 'hard'] as const;

export const QTYPES = [
  { id: 'mcq', label: 'MCQs (adaptive)', adaptive: true },
  { id: 'coding', label: 'Coding problems (fixed)', adaptive: false },
  { id: 'open', label: 'Open-ended (fixed)', adaptive: false },
];

export const CHAPTER_TOPIC_MAP: Record<number, string[]> = {
  1012: ['HTML & CSS'],
  1014: ['HTML & CSS'],
  1016: ['HTML & CSS'],
  1022: ['JavaScript'],
  1024: ['JavaScript'],
  1026: ['JavaScript'],
  1032: ['JavaScript'],
  1034: ['JavaScript'],
  2012: ['Python'],
  2014: ['Python'],
  3012: ['Personal Finance'],
  3014: ['Personal Finance'],
};

export const POOL_MULTIPLIER = 3;
