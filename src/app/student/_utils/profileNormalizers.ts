/**
 * Shared normalization utilities for learner profile payloads.
 * Used by ProfilePage and EditProfilePage.
 */
import { MONTHS } from '@/lib/profile.mockData';

export const normalizeText = (value?: any): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const stringValue = String(value).trim();
  return stringValue ? stringValue : null;
};

export const normalizeEmail = (value?: any): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const stringValue = String(value).trim();
  if (!stringValue) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(stringValue) ? stringValue : null;
};

export const normalizeOptionalUrl = (value?: any): string | null => {
  if (value === null || value === undefined || value === '') return null;
  const stringValue = String(value).trim();
  if (!stringValue) return null;

  const valueWithProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(stringValue)
    ? stringValue
    : `https://${stringValue}`;

  try {
    return new URL(valueWithProtocol).toString();
  } catch {
    return null;
  }
};

export const normalizeGithubUrl = (value?: any): string | null => {
  const normalizedUrl = normalizeOptionalUrl(value);
  if (!normalizedUrl) return null;

  const host = new URL(normalizedUrl).hostname.toLowerCase();
  return host === 'github.com' || host === 'www.github.com' ? normalizedUrl : null;
};

export const parseScore = (value: string | number | null): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Converts a structured date object { day?, month, year } OR a plain ISO string
 * into a "yyyy-MM-dd" string for sending to the API.
 * Returns undefined when the value is empty/invalid.
 *
 * Used in buildLearnerProfilePayload (ProfilePage + EditProfilePage).
 */
export const formatMonthYearToDate = (
  value?: { day?: string; month: string; year: string } | string
): string | undefined => {
  if (!value) return undefined;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (!value.year) return undefined;

  const normalizedMonth = String(value.month || '').trim();
  const numericMonth = Number(normalizedMonth);
  let month = '01';

  if (Number.isFinite(numericMonth) && numericMonth >= 1 && numericMonth <= 12) {
    month = String(Math.trunc(numericMonth)).padStart(2, '0');
  } else {
    const monthIndex = MONTHS.findIndex(
      (m) => m.toLowerCase() === normalizedMonth.toLowerCase()
    );
    month = monthIndex >= 0 ? String(monthIndex + 1).padStart(2, '0') : '01';
  }

  const numericDay = Number(String(value.day || '').trim());
  const day =
    Number.isFinite(numericDay) && numericDay >= 1 && numericDay <= 31
      ? String(Math.trunc(numericDay)).padStart(2, '0')
      : '01';

  return `${value.year}-${month}-${day}`;
};

/**
 * Converts a month name string (e.g. "June") to its 1-based number (6).
 * Returns undefined when the value is empty or not a valid month.
 *
 * Used in ProfilePage + EditProfilePage for building API payloads.
 */
export const toMonthNumber = (month?: string): number | undefined => {
  if (!month) return undefined;
  const index = MONTHS.indexOf(month);
  return index >= 0 ? index + 1 : undefined;
};

/**
 * Converts a numeric or string month value to its full month name (e.g. 6 → "June").
 * Accepts both number (6) and string ("6" or "june").
 * Returns empty string for invalid input.
 *
 * Used in ProfilePage + EditProfilePage for display purposes.
 */
export const toMonthName = (value?: string | number | null): string => {
  if (value === null || value === undefined) return '';
  const monthNumber = Number(value);
  if (Number.isFinite(monthNumber) && monthNumber >= 1 && monthNumber <= 12) {
    return MONTHS[monthNumber - 1] || '';
  }
  const normalized = String(value).trim().toLowerCase();
  const mapped = MONTHS.find((m) => m.toLowerCase() === normalized);
  return mapped || '';
};

/**
 * Maps an array of WorkExperience objects into the shape expected by the API payload.
 * Used in buildLearnerProfilePayload in both ProfilePage and EditProfilePage.
 */
export const mapWorkExperiencesToPayload = (
  workExperiences: import('@/lib/profile.types').WorkExperience[]
) =>
  workExperiences.map((experience) => ({
    title: experience.role,
    company: experience.companyName,
    startDate: formatMonthYearToDate(experience.startDate),
    isCurrentlyWorking: experience.isCurrentlyWorking,
    endDate: experience.isCurrentlyWorking
      ? null
      : formatMonthYearToDate(experience.endDate),
    description: experience.responsibilities,
  }));
