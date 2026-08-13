import { z } from 'zod';
import { MONTHS } from '@/lib/profile.mockData';

// Simple helper functions
const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth() + 1; // 1-based
const getMonthNumber = (monthName: string): number => MONTHS.indexOf(monthName) + 1;
const isPassout = (yearOfStudy: string): boolean => yearOfStudy === 'passed_out';

// Main validation function - simple and clear
export const validateGraduationDate = (
  graduationDate: { month: string; year: string },
  yearOfStudy: string
) => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  
  // Check required fields first - priority over other validations
  if (!graduationDate.month && !graduationDate.year) {
    return { isValid: false, error: 'Graduation month and year are required' };
  }
  if (!graduationDate.month) {
    return { isValid: false, error: 'Graduation month is required' };
  }
  if (!graduationDate.year) {
    return { isValid: false, error: 'Graduation year is required' };
  }
  
  const selectedYear = Number(graduationDate.year);
  const selectedMonth = getMonthNumber(graduationDate.month);
  
  if (isPassout(yearOfStudy)) {
    // Passout: 1990 to current year, current year only up to current month
    if (selectedYear < 1990) {
      return { isValid: false, error: 'Graduation year cannot be before 1990' };
    }
    if (selectedYear > currentYear) {
      return { isValid: false, error: 'Future graduation dates are not allowed' };
    }
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      return { isValid: false, error: `For ${currentYear}, only months up to ${MONTHS[currentMonth - 1]} are allowed` };
    }
  } else {
    // Current students: only current year
    if (selectedYear !== currentYear) {
      return { isValid: false, error: `For ${yearOfStudy} year students, only ${currentYear} is allowed` };
    }
  }
  
  return { isValid: true, error: null };
};

// Get allowed years for dropdown
export const getAllowedYears = (yearOfStudy: string): string[] => {
  const currentYear = getCurrentYear();
  
  if (isPassout(yearOfStudy)) {
    const years = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push(year.toString());
    }
    return years;
  } else {
    return [currentYear.toString()];
  }
};

// Get allowed months for dropdown
export const getAllowedMonths = (yearOfStudy: string, selectedYear: string): string[] => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  const selectedYearNum = Number(selectedYear);
  
  if (isPassout(yearOfStudy) && selectedYearNum === currentYear) {
    return MONTHS.slice(0, currentMonth);
  } else {
    return [...MONTHS];
  }
};