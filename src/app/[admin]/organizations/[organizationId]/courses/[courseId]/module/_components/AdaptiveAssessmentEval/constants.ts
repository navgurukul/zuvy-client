export type LevelId = 'E' | 'D' | 'C' | 'B' | 'A' | 'A+';

export const THEME = {
  bg: 'hsl(var(--background))',
  card: 'hsl(var(--card))',
  border: 'hsl(var(--border))',
  shadowSoft: '0 1px 3px rgba(0,0,0,0.1)',
  shadowStrong: '0 4px 6px rgba(0,0,0,0.1)',
  text: 'hsl(var(--text-primary))',
  textSub: 'hsl(var(--text-secondary))',
  textTertiary: 'hsl(var(--text-tertiary))',
  textMuted: 'hsl(var(--text-muted))',
  primary: 'hsl(var(--primary))',
  primaryDark: 'hsl(var(--primary-dark))',
  primaryMid: 'hsl(var(--primary))',
  primaryLight: 'hsl(var(--primary-light))',
  secondary: 'hsl(var(--secondary))',
  secondaryDark: 'hsl(var(--secondary-dark))',
  secondaryLight: 'hsl(var(--secondary-light))',
  danger: 'hsl(var(--destructive))',
  dangerDark: 'hsl(var(--destructive-dark))',
  dangerLight: 'hsl(var(--destructive-light))',
  success: 'hsl(var(--success))',
  successDark: 'hsl(var(--success-dark))',
  successLight: 'hsl(var(--success-light))',
  warning: 'hsl(var(--warning))',
  warningDark: 'hsl(var(--warning-dark))',
  warningLight: 'hsl(var(--warning-light))',
  info: 'hsl(var(--info))',
  infoLight: 'hsl(var(--info-light))',
  muted: 'hsl(var(--muted))',
};

// Dark mode theme values
export const THEME_DARK = {
  infoLight: 'rgba(59, 130, 246, 0.2)',  // blue with 20% opacity
  info: 'hsl(var(--muted-foreground))',
};

export const DIFF_BG: Record<string, string> = {
  easy: 'hsl(var(--success-light))',
  medium: 'hsl(var(--warning-light))',
  hard: 'hsl(var(--destructive-light))',
};

export const DIFF_COLOR: Record<string, string> = {
  easy: 'hsl(var(--success-dark))',
  medium: 'hsl(var(--warning-dark))',
  hard: 'hsl(var(--destructive-dark))',
};

// Dark mode versions with reduced opacity using rgba with fallback colors
export const DIFF_BG_DARK: Record<string, string> = {
  easy: 'rgba(34, 197, 94, 0.2)',    // green with 20% opacity
  medium: 'rgba(251, 146, 60, 0.2)',  // orange with 20% opacity
  hard: 'rgba(239, 68, 68, 0.2)',     // red with 20% opacity
};

export const DIFF_COLOR_DARK: Record<string, string> = {
  easy: 'hsl(var(--muted-foreground))',
  medium: 'hsl(var(--muted-foreground))',
  hard: 'hsl(var(--muted-foreground))',
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
  // { id: 'coding', label: 'Coding problems (fixed)', adaptive: false },
  // { id: 'open', label: 'Open-ended (fixed)', adaptive: false },
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
