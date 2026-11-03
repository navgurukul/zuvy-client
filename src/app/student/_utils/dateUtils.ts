/**
 * Shared date utility functions for student profile forms.
 * Used by WorkExperienceComponents and ProfileStep2 (ProjectModal).
 */

/**
 * Converts a structured date object OR an ISO string into a yyyy-MM-dd string
 * suitable for an <input type="month"> or <input type="date"> HTML element.
 *
 * Works for both WorkExperience dates { month, year } and
 * ExternalProject dates { day?, month, year }.
 */
export const formatDateForInput = (
  dateValue?: { day?: string; month: string; year: string } | string
): string => {
  if (!dateValue) return '';

  // Already a plain string (e.g. "2023-06-01") — return as-is
  if (typeof dateValue === 'string') return dateValue;

  if (!dateValue.year || !dateValue.month) return '';

  const month = parseMonthToIso(dateValue.month);
  const day = parseDayToIso(dateValue.day);
  return `${dateValue.year}-${month}-${day}`;
};

/**
 * Returns today's date as a yyyy-MM-dd string (used as max value for date inputs).
 */
export const getTodayInputValue = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns true if leftDate string is strictly earlier than rightDate string.
 * Dates must be comparable strings (e.g. "2023-01-01").
 */
export const isEarlierThan = (leftDate?: string, rightDate?: string): boolean => {
  if (!leftDate || !rightDate) return false;
  return leftDate < rightDate;
};

// ─── Internal helpers (not exported — only used by formatDateForInput) ────────

/**
 * Converts a month value (numeric string "6" or name "June") to a zero-padded ISO month "06".
 */
const parseMonthToIso = (monthValue: string): string => {
  const trimmed = String(monthValue || '').trim();
  if (!trimmed) return '01';

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) {
    return String(Math.trunc(numeric)).padStart(2, '0');
  }

  // Try matching month name (e.g. "June" → 6)
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
  ];
  const index = monthNames.indexOf(trimmed.toLowerCase());
  return index >= 0 ? String(index + 1).padStart(2, '0') : '01';
};

/**
 * Converts a day string to a zero-padded ISO day "01"–"31". Defaults to "01".
 */
const parseDayToIso = (dayValue?: string): string => {
  const numeric = Number(String(dayValue || '').trim());
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 31) {
    return String(Math.trunc(numeric)).padStart(2, '0');
  }
  return '01';
};
