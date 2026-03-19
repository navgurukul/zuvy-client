'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProfileStep1Component from '@/app/student/profile/ProfileStep1';
import ProfileStep2Component from '@/app/student/profile/ProfileStep2';
import ProfileStep3Component from '@/app/student/profile/ProfileStep3';
import ProfileStep4Component from '@/app/student/profile/ProfileStep4';
import { useOnboardingStorage } from '@/hooks/use-profile';
import type { OnboardingStep1 as Step1Type, OnboardingStep2 as Step2Type, OnboardingStep3 as Step3Type, OnboardingStep4 as Step4Type } from '@/lib/profile.types';
import { useRouter } from 'next/navigation';
import { AlertCircle, Info, Sparkles } from 'lucide-react';
import { MONTHS } from '@/lib/profile.mockData';
import { toast } from '@/components/ui/use-toast';
import useSaveLearnerProfile from '@/hooks/useSaveLearnerProfile';
import useResumeParse from '@/hooks/useResumeParse';
import useParsedResume from '@/hooks/useParsedResume';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OnboardingPageProps {
  userEmail?: string;
  userFullName?: string;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ userEmail = '', userFullName = '' }) => {
  const router = useRouter();

  const {
    onboardingData,
    isLoading,
    updateStepData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingStorage();

  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes in seconds
  const [showAlert, setShowAlert] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [isSavingStepData, setIsSavingStepData] = useState(false);
  
  // Track current step data to auto-save
  const [currentStepData, setCurrentStepData] = useState<any>(null);
  const { saveLearnerProfile, loading: isLearnerProfileSaving } = useSaveLearnerProfile();
  const { parseResume } = useResumeParse();
  const { refetchParsedResume } = useParsedResume(false);

  const formatMonthYearToDate = (value?: { month: string; year: string }) => {
    if (!value?.year) {
      return undefined;
    }
    const monthIndex = MONTHS.indexOf(value.month || '');
    const month = monthIndex >= 0 ? String(monthIndex + 1).padStart(2, '0') : '01';
    return `${value.year}-${month}-01`;
  };

  const toMonthNumber = (month?: string) => {
    if (!month) {
      return undefined;
    }
    const monthIndex = MONTHS.indexOf(month);
    return monthIndex >= 0 ? monthIndex + 1 : undefined;
  };

  const buildLearnerProfilePayload = (
    step1Data: Step1Type,
    step2Data?: Step2Type,
    step3Data?: Step3Type,
    step4Data?: Step4Type
  ) => {
    const normalizeText = (value?: any) => {
      if (value === null || value === undefined || value === '') return null;
      const stringValue = String(value).trim();
      return stringValue ? stringValue : null;
    };

    const normalizeEmail = (value?: any) => {
      if (value === null || value === undefined || value === '') return null;
      const stringValue = String(value).trim();
      if (!stringValue) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(stringValue) ? stringValue : null;
    };

    const isValidOtherCollege = (value?: any) => {
      if (value === null || value === undefined || value === '') return false;
      const stringValue = String(value).trim();
      if (!stringValue || stringValue.length < 3) return false;
      return /^[a-zA-Z0-9\s.,'&()\-]+$/.test(stringValue);
    };

    const collegeNameValue = normalizeText(step1Data.collegeName);
    const otherCollegeValue = isValidOtherCollege(step1Data.customCollege)
      ? step1Data.customCollege!.trim()
      : null;

    const finalCollegeName = collegeNameValue || null;
    const finalOtherCollegeName = finalCollegeName ? null : otherCollegeValue;

    const technicalSkills = Array.from(
      new Set([...(step2Data?.autoDetectedSkills || []), ...(step2Data?.additionalSkills || [])].filter(Boolean))
    );

    const projects = (step2Data?.externalProjects || []).map((project) => ({
      title: project.title,
      description: project.oneLineDescription,
      techStack: project.techStack || [],
      projectType: project.projectType,
      startDate: formatMonthYearToDate(project.startDate),
      endDate: formatMonthYearToDate(project.endDate),
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl,
      detailedDescription: project.detailedDescription,
    }));

    const academicPerformance = step3Data?.academicPerformance;
    const collegeScore = academicPerformance?.marksFormat === 'CGPA'
      ? academicPerformance?.cgpa
      : academicPerformance?.percentage;

    const workExperiences = (step3Data?.workExperiences || []).map((experience) => ({
      title: experience.role,
      company: experience.companyName,
      startDate: formatMonthYearToDate(experience.startDate),
      endDate: experience.isCurrentlyWorking ? undefined : formatMonthYearToDate(experience.endDate),
      description: experience.responsibilities,
    }));

    const leetcodeUsername = step3Data?.competitiveProfiles?.find((item) => item.platform === 'LeetCode')?.username;
    const codechefUsername = step3Data?.competitiveProfiles?.find((item) => item.platform === 'CodeChef')?.username;
    const codeforcesUsername = step3Data?.competitiveProfiles?.find((item) => item.platform === 'Codeforces')?.username;

    const normalizedLeetcodeUsername = normalizeText(leetcodeUsername);
    const normalizedCodechefUsername = normalizeText(codechefUsername);
    const normalizedCodeforcesUsername = normalizeText(codeforcesUsername);

    // Build platform profiles as objects with username and optional rating
    const buildProfileObject = (username?: string | null, profile?: any) => {
      if (!username) return null;
      const obj: any = { username };
      if (profile?.rating !== undefined && profile?.rating !== null) {
        obj.rating = String(profile.rating);
      }
      return obj;
    };

    const leetcodeProfile = buildProfileObject(normalizedLeetcodeUsername, step3Data?.competitiveProfiles?.find((item) => item.platform === 'LeetCode'));
    const codechefProfile = buildProfileObject(normalizedCodechefUsername, step3Data?.competitiveProfiles?.find((item) => item.platform === 'CodeChef'));
    const codeforcesProfile = buildProfileObject(normalizedCodeforcesUsername, step3Data?.competitiveProfiles?.find((item) => item.platform === 'Codeforces'));

    const leetcodeProfiles = leetcodeProfile ? [leetcodeProfile] : [];
    const codechefProfiles = codechefProfile ? [codechefProfile] : [];
    const codeforcesProfiles = codeforcesProfile ? [codeforcesProfile] : [];

    const preferredContactMethods = [
      step4Data?.communicationPreferences?.email ? 'Email' : null,
      step4Data?.communicationPreferences?.whatsapp ? 'Whatsapp' : null,
      step4Data?.communicationPreferences?.phone ? 'Phone' : null,
    ].filter(Boolean) as string[];

    return {
      fullName: normalizeText(step1Data.fullName),
      phoneNumber: normalizeText(step1Data.phoneNumber),
      email: normalizeEmail(step1Data.email),
      linkedinProfile: normalizeText(step1Data.linkedin),
      collegeName: finalCollegeName,
      otherCollegeName: finalOtherCollegeName,
      degree: normalizeText(step1Data.degree),
      branch: normalizeText(step1Data.branch),
      yearOfStudy: normalizeText(step1Data.yearOfStudy),
      graduationMonth: toMonthNumber(step1Data.graduationDate?.month),
      graduationYear: step1Data.graduationDate?.year ? Number(step1Data.graduationDate.year) : undefined,
      currentStatus: normalizeText(step1Data.currentStatus),
      technicalSkills,
      projects,
      collegeStream: normalizeText(step1Data.branch),
      collegeScore: collegeScore !== undefined ? String(collegeScore) : undefined,
      collegeScoreType: academicPerformance?.marksFormat === 'Percentage' ? '%' : academicPerformance?.marksFormat,
      class12Board: normalizeText(academicPerformance?.class12Board),
      class12Score: academicPerformance?.class12Percentage !== undefined ? String(academicPerformance.class12Percentage) : undefined,
      class12ScoreType: academicPerformance?.class12Format === 'Percentage' ? '%' : academicPerformance?.class12Format,
      class10Board: normalizeText(academicPerformance?.class10Board),
      class10Score: academicPerformance?.class10Marks !== undefined ? String(academicPerformance.class10Marks) : undefined,
      class10ScoreType: academicPerformance?.class10Format === 'Percentage' ? '%' : academicPerformance?.class10Format,
      hasWorkExperience: step3Data?.hasInternshipExperience,
      workExperiences,
      leetcodeUsername: normalizedLeetcodeUsername,
      codechefUsername: normalizedCodechefUsername,
      codeforcesUsername: normalizedCodeforcesUsername,
      leetcodeProfiles,
      codechefProfiles,
      codeforcesProfiles,
      targetRoles: step4Data?.targetRoles || [],
      preferredLocations: step4Data?.locationPreferences?.cities || [],
      openToRemote: step4Data?.locationPreferences?.remote,
      internshipStipend: normalizeText(step4Data?.salaryExpectations?.internship),
      fullTimeCtc: normalizeText(step4Data?.salaryExpectations?.fullTime),
      preferredContactMethods,
    };
  };

  // Auto-save current step data
  const handleAutoSave = (stepNumber: number, data: any) => {
    setCurrentStepData(data);
    updateStepData(stepNumber, data);
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeRemaining === 0 && onboardingData?.currentStep === 4) {
      setShowAlert(true);
    }
  }, [timeRemaining, onboardingData?.currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleStep1Complete = (data: Step1Type) => {
    updateStepData(1, data);
    goToNextStep();
  };

  const handleStep2Complete = (data: Step2Type) => {
    updateStepData(2, data);
    goToNextStep();
  };

  const handleStep3Complete = (data: Step3Type) => {
    updateStepData(3, data);
    goToNextStep();
  };

  const handleStep4Complete = async (data: Step4Type) => {
    if (!onboardingData?.step1) {
      toast.error({
        title: 'Missing basic details',
        description: 'Please complete Step 1 before finishing setup.',
      });
      return;
    }

    updateStepData(4, data);
    setIsSavingStepData(true);

    let latestData = onboardingData;
    try {
      const raw = localStorage.getItem('zuvy_onboarding_data');
      if (raw) {
        latestData = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to read latest onboarding draft from storage:', err);
    }

    const payload = buildLearnerProfilePayload(
      (latestData?.step1 || onboardingData?.step1) as Step1Type,
      latestData?.step2 || onboardingData?.step2,
      latestData?.step3 || onboardingData?.step3,
      data
    );

    const result = await saveLearnerProfile(payload);

    if (!result.success) {
      toast.error({
        title: 'Save failed',
        description: 'Could not save complete profile. Please check your details and try again.',
      });
      setIsSavingStepData(false);
      return;
    }

    toast.success({
      title: 'Profile saved',
      description: 'Your profile has been saved successfully.',
    });

    completeOnboarding();
    setIsSavingStepData(false);

    setTimeout(() => {
      router.push('/student');
    }, 500);
  };

  const handleSkip = () => {
    // Move to next step instead of going to dashboard
    if (currentStep < 4) {
      goToNextStep();
    } else {
      // On final step, mark as skipped and go to dashboard
      skipOnboarding();
      router.push('/student');
    }
  };

  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });

  const extractTextFromPdf = async (data: ArrayBuffer) => {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
    }

    let pdf: any;
    try {
      pdf = await pdfjs.getDocument({ data }).promise;
    } catch {
      // Fallback path for environments where worker bootstrapping fails.
      pdf = await pdfjs.getDocument({ data, disableWorker: true } as any).promise;
    }
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const plainText = content.items
        .map((item: any) => (item?.str || '').trim())
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Reconstruct lines using y-position so section parsing remains accurate.
      const rows = new Map<number, string[]>();
      content.items.forEach((item: any) => {
        const str = (item?.str || '').trim();
        if (!str) {
          return;
        }
        const yRaw = Array.isArray(item?.transform) ? item.transform[5] : 0;
        const y = Math.round(Number(yRaw) || 0);
        if (!rows.has(y)) {
          rows.set(y, []);
        }
        rows.get(y)?.push(str);
      });

      const pageText = Array.from(rows.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([, chunks]) => chunks.join(' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');

      fullText += `${pageText.length >= plainText.length * 0.4 ? pageText : plainText}\n`;
    }
    return fullText;
  };

  const extractTextFromDocx = async (data: ArrayBuffer) => {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: data });
    return result.value || '';
  };

  const extractSkillsFromText = (text: string): string[] => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const skillHeadingIndex = lines.findIndex((line) =>
      /^(skills|technical skills|key skills|technologies)\b/i.test(line)
    );
    if (skillHeadingIndex === -1) {
      return [];
    }
    const skillsLines: string[] = [];
    for (let i = skillHeadingIndex + 1; i < Math.min(lines.length, skillHeadingIndex + 8); i += 1) {
      const line = lines[i];
      if (/^(education|experience|projects|certifications|summary|objective)\b/i.test(line)) {
        break;
      }
      skillsLines.push(line);
    }
    const raw = skillsLines.join(' ');
    const parts = raw
      .split(/[,|\\-\\/]+/)
      .map((skill) => skill.trim())
      .filter((skill) => skill.length >= 2 && skill.length <= 32);
    const unique = Array.from(new Set(parts));
    return unique.slice(0, 12);
  };

  const extractCollegeFromText = (text: string): string => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const cleanedLines = lines.map((line) => line.replace(/[|•]+/g, ' ').replace(/\s{2,}/g, ' ').trim());
    const candidates = cleanedLines.filter((line) => {
      if (line.length < 4 || line.length > 90) {
        return false;
      }
      if (/(@|linkedin\.com|github\.com|\+?\d{8,}|summary|experience|projects|skills|certification)/i.test(line)) {
        return false;
      }
      return /(university|college|institute|school|iit|nit|iiit|polytechnic)/i.test(line);
    });
    if (candidates.length === 0) {
      return '';
    }
    const best = candidates.sort((a, b) => a.length - b.length)[0];
    return best;
  };

  const normalizeMonth = (raw?: string): string => {
    if (!raw) {
      return '';
    }
    const key = raw.toLowerCase();
    const map: Record<string, string> = {
      jan: 'January',
      january: 'January',
      feb: 'February',
      february: 'February',
      mar: 'March',
      march: 'March',
      apr: 'April',
      april: 'April',
      may: 'May',
      jun: 'June',
      june: 'June',
      jul: 'July',
      july: 'July',
      aug: 'August',
      august: 'August',
      sep: 'September',
      sept: 'September',
      september: 'September',
      oct: 'October',
      october: 'October',
      nov: 'November',
      november: 'November',
      dec: 'December',
      december: 'December',
    };
    const month = map[key] || '';
    return MONTHS.includes(month) ? month : '';
  };

  const extractGraduationDate = (text: string) => {
    const monthYearMatch = text.match(
      /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|sept|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s\-\/,]+(20\d{2})/i
    );
    const month = normalizeMonth(monthYearMatch?.[1]);
    const year = monthYearMatch?.[2] || '';

    if (year) {
      return { month, year };
    }

    const yearMatches = text.match(/\b(20\d{2})\b/g) || [];
    const years = yearMatches.map((value) => parseInt(value, 10)).filter((value) => value >= 2000 && value <= 2100);
    if (years.length === 0) {
      return { month: '', year: '' };
    }
    const latestYear = Math.max(...years).toString();
    return { month: '', year: latestYear };
  };

  const extractDegreeAndBranch = (text: string) => {
    const normalized = text.replace(/\s+/g, ' ').toLowerCase();
    let degree = '';
    if (/\bbe\s*\(cs\)/i.test(normalized)) {
      degree = 'BE (CS)';
    } else if (/b\.?\s*tech|bachelor of technology|btech/i.test(normalized)) {
      degree = 'B.Tech';
    } else if (/\bb\.?\s*e\b|bachelor of engineering|beng/i.test(normalized)) {
      degree = 'B.E';
    } else if (/b\.?\s*tech\s*it|btech\s*it/i.test(normalized)) {
      degree = 'B.Tech IT';
    } else if (/\bdiploma\b/i.test(normalized)) {
      degree = 'Diploma';
    } else if (/\bb\.?\s*sc\b|bachelor of science/i.test(normalized)) {
      degree = 'BSc';
    } else if (/\bbs\b|bachelor of science/i.test(normalized)) {
      degree = 'BS';
    }

    const branchPatterns: Array<{ regex: RegExp; value: string }> = [
      { regex: /(computer science|c\.?s\.?e\b|cse\b)/i, value: 'Computer Science & Engineering' },
      { regex: /(information technology|\bit\b)/i, value: 'Information Technology' },
      { regex: /(electronics( and| &)? communication|e\.?c\.?e\b|ece\b)/i, value: 'Electronics & Communication' },
      { regex: /(electrical)/i, value: 'Electrical Engineering' },
      { regex: /(mechanical)/i, value: 'Mechanical Engineering' },
      { regex: /(civil)/i, value: 'Civil Engineering' },
      { regex: /(chemical)/i, value: 'Chemical Engineering' },
      { regex: /(biotech|biotechnology)/i, value: 'Biotechnology' },
      { regex: /(aerospace)/i, value: 'Aerospace Engineering' },
      { regex: /(automobile)/i, value: 'Automobile Engineering' },
    ];

    let branch = '';
    for (const entry of branchPatterns) {
      if (entry.regex.test(normalized)) {
        branch = entry.value;
        break;
      }
    }

    if (!degree && /engineering/i.test(normalized)) {
      degree = 'B.Tech';
    }

    return { degree, branch };
  };

  const extractProjectsFromText = (text: string, skills: string[]): Step2Type['externalProjects'] => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/[•|]+/g, ' ').trim())
      .filter(Boolean);

    const headingIndex = lines.findIndex((line) => /^(projects?|academic projects?)\b/i.test(line));
    if (headingIndex === -1) {
      return [];
    }

    const projectLines: string[] = [];
    for (let i = headingIndex + 1; i < Math.min(lines.length, headingIndex + 20); i += 1) {
      const line = lines[i];
      if (/^(education|experience|internships?|skills|certifications?|achievements|summary|objective)\b/i.test(line)) {
        break;
      }
      if (line.length < 4) {
        continue;
      }
      projectLines.push(line.replace(/^[-*\d.)\s]+/, '').trim());
    }

    const uniqueLines = Array.from(new Set(projectLines)).slice(0, 3);
    return uniqueLines.map((line, index) => {
      const titlePart = line.split(/[:|-]/)[0]?.trim() || `Project ${index + 1}`;
      const titleWords = titlePart.split(/\s+/).slice(0, 6).join(' ');
      const loweredLine = line.toLowerCase();
      const inferredTech = skills.filter((skill) => {
        const normalizedSkill = (skill || '').trim().toLowerCase();
        return normalizedSkill ? loweredLine.includes(normalizedSkill) : false;
      });

      return {
        id: `resume-project-${Date.now()}-${index}`,
        title: titleWords || `Project ${index + 1}`,
        oneLineDescription: line.slice(0, 180),
        detailedDescription: line,
        techStack: inferredTech,
        projectType: 'Solo',
      };
    });
  };

  const extractAcademicPerformanceFromText = (text: string): Step3Type['academicPerformance'] => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const cgpaMatch = normalized.match(/(?:cgpa|gpa)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i);
    const percentageMatch = normalized.match(/(?:percentage|percent|\bmarks\b)\s*[:\-]?\s*(\d{1,2}(?:\.\d{1,2})?)/i);

    if (cgpaMatch?.[1]) {
      const cgpa = Number(cgpaMatch[1]);
      if (!Number.isNaN(cgpa) && cgpa > 0 && cgpa <= 10) {
        return { marksFormat: 'CGPA', cgpa };
      }
    }

    if (percentageMatch?.[1]) {
      const percentage = Number(percentageMatch[1]);
      if (!Number.isNaN(percentage) && percentage > 0 && percentage <= 100) {
        return { marksFormat: 'Percentage', percentage };
      }
    }

    return undefined;
  };

  const extractHasInternshipExperience = (text: string): boolean =>
    /\b(internship|intern|worked at|work experience|software engineer intern)\b/i.test(text);

  const extractTargetRoles = (text: string): string[] => {
    const roleCandidates = [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Data Analyst',
      'Data Scientist',
      'Machine Learning Engineer',
      'Software Engineer',
      'DevOps Engineer',
    ];
    return roleCandidates.filter((role) => new RegExp(role.replace(/\s+/g, '\\s+'), 'i').test(text));
  };

  const parseResumeText = (text: string, filename?: string) => {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    // Try multiple name extraction strategies
    const nameMatch =
      normalizedText.match(/(?:name[:\s]+)([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3})/i) ||
      null;
    const leadingNameMatch = normalizedText.match(/^([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){1,3})\b/);

    // Broader name pattern: Any line in top 15 that's 2-4 capitalized words
    const topLines = lines.slice(0, 15);
    const capitalizedLineName = topLines.find((line) => {
      if (line.length < 3 || line.length > 60) return false;
      if (/[0-9@+]/.test(line)) return false;
      if (/resume|curriculum|vitae|email|phone|linkedin|mobile|contact|summary|objective|skills|experience|education|projects/i.test(line)) return false;
      const words = line.split(/\s+/);
       // More flexible: at least 1 word starting with capital, others can be any case (but not all lowercase)
       return (
         words.length >= 1 &&
         words.length <= 4 &&
         words[0] && /^[A-Z]/.test(words[0]) && // First word must start with capital
         words.some((w) => /^[A-Z][a-z]/.test(w)) && // At least one word with proper title case
         !/^\d/.test(line) && // Don't start with number
         !/^[a-z]/.test(line) // Don't start with lowercase
       );
    });

    // Extract name from filename if all else fails (e.g., "Abhay_DTU_C1.pdf" -> "Abhay")
    const filenameExtractedName = filename ?
      filename
        .replace(/\.(pdf|docx)$/i, '')
        .split(/[_\-()]/)[0] // Take first part before underscore/dash/paren
        .trim()
      : '';
    const isValidNameFromFile = filenameExtractedName && 
      filenameExtractedName.length >= 2 && 
      filenameExtractedName.length <= 30 &&
      /^[A-Za-z]/.test(filenameExtractedName) &&
      !/resume|cv|curriculum|document/i.test(filenameExtractedName);

    const fallbackName =
      topLines.find((line) =>
        /^[A-Za-z][A-Za-z.'-]+(\s+[A-Za-z.'-]+){0,3}$/.test(line) &&
        !/(resume|curriculum|vitae|email|phone|linkedin|mobile|contact)/i.test(line)
      ) ||
      topLines.find((line) =>
        line.length <= 60 &&
        !/(resume|curriculum|vitae|email|phone|linkedin|mobile|contact|summary|objective)/i.test(line) &&
        /^[A-Za-z][A-Za-z.'-]+(\s+[A-Za-z.'-]+){0,4}$/.test(line)
      ) ||
      '';
    const fullName = nameMatch?.[1] || leadingNameMatch?.[1] || capitalizedLineName || fallbackName || (isValidNameFromFile ? filenameExtractedName : '');

    // More lenient phone extraction: allow formatting variations
    const phoneMatch = normalizedText.match(
      /(?:\+?91[\s.\-]?)?([6-9]\d{9})|(?:\+?91)?[\s.\-]?([6-9])[\s.\-]?(\d[\s.\-]?){8}/
    );
    let phoneNumber = phoneMatch?.[1] || '';
    if (!phoneNumber && phoneMatch) {
      const allDigits = (phoneMatch[0] || '')
        .replace(/[^\d]/g, '')
        .replace(/^91/, '');
      phoneNumber = allDigits.slice(-10);
    }

    const emailMatch = normalizedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const email = emailMatch?.[0] || '';

    const linkedinMatch = normalizedText.match(
      /(https?:\/\/)?(www\.)?linkedin\.com\/[a-z0-9\-_/]+/i
    );
    const rawLinkedin = linkedinMatch?.[0] || '';
    const linkedin = rawLinkedin
      ? rawLinkedin.startsWith('http')
        ? rawLinkedin
        : `https://${rawLinkedin.replace(/^\/+/, '')}`
      : '';

    const skills = extractSkillsFromText(text);
    const collegeName = extractCollegeFromText(text);
    const { degree, branch } = extractDegreeAndBranch(text);
    const graduationDate = extractGraduationDate(text);
    const projects = extractProjectsFromText(text, skills);
    const academicPerformance = extractAcademicPerformanceFromText(text);
    const hasInternshipExperience = extractHasInternshipExperience(text);
    const targetRoles = extractTargetRoles(text);

    // Detailed extraction logging for debugging
    if (typeof window !== 'undefined') {
      console.log('Resume extraction details:', {
        fullName: { value: fullName, strategies: { nameMatch: !!nameMatch, leadingName: !!leadingNameMatch, capitalizedLine: !!capitalizedLineName, fallback: !!fallbackName, filename: isValidNameFromFile && filenameExtractedName } },
        phoneNumber: { value: phoneNumber, found: !!phoneMatch },
        email: { value: email, found: !!emailMatch },
        linkedin: { value: linkedin, found: !!linkedinMatch },
        collegeName: { value: collegeName, found: !!collegeName },
        degree: { value: degree, found: !!degree },
        branch: { value: branch, found: !!branch },
        graduationDate: { month: graduationDate.month, year: graduationDate.year },
        projectsCount: projects.length,
        hasAcademicPerformance: !!academicPerformance,
        hasInternshipExperience,
        targetRoles,
        skillsCount: skills.length,
      });
    }

    return {
      fullName,
      phoneNumber,
      email,
      linkedin,
      skills,
      collegeName,
      degree,
      branch,
      graduationDate,
      projects,
      academicPerformance,
      hasInternshipExperience,
      targetRoles,
    };
  };

  const processResumeFile = async (
    file: File,
    source: 'resume' | 'linkedin-pdf'
  ) => {
    setResumeError('');
    setResumeFileName(file.name);
    setIsParsingResume(true);
    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isDocx =
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx');

      const isAllowedFile = source === 'linkedin-pdf' ? isPdf : isPdf || isDocx;

      if (!isAllowedFile) {
        throw new Error(
          source === 'linkedin-pdf'
            ? 'Please upload a LinkedIn downloaded resume in PDF format.'
            : 'Please upload a PDF or DOCX resume.'
        );
      }

      const postResult = await parseResume(file);
      if (!postResult?.success) {
        throw new Error(postResult?.error || 'Failed to upload and parse resume.');
      }

      const parsedResponse = await refetchParsedResume();
      const parsedData = parsedResponse?.data;

      const normalizeProjects = (projects: any[]): Step2Type['externalProjects'] => {
        if (!Array.isArray(projects)) {
          return [];
        }

        return projects.map((project: any, index: number) => {
          if (typeof project === 'string') {
            return {
              id: `resume-project-${Date.now()}-${index}`,
              title: project || `Project ${index + 1}`,
              oneLineDescription: '',
              detailedDescription: '',
              techStack: [],
              githubUrl: '',
              demoUrl: '',
              projectType: 'Solo' as const,
            };
          }

          const techStack = Array.isArray(project?.techStack)
            ? project.techStack.filter(Boolean)
            : [];

          return {
            id: `resume-project-${Date.now()}-${index}`,
            title: project?.title || project?.name || `Project ${index + 1}`,
            oneLineDescription: project?.oneLineDescription || project?.description || '',
            detailedDescription: project?.detailedDescription || project?.description || '',
            techStack,
            githubUrl: project?.githubUrl || project?.github || '',
            demoUrl: project?.demoUrl || project?.liveUrl || '',
            projectType: 'Solo' as const,
          };
        });
      };

      const parsed = {
        fullName: parsedData?.name || '',
        phoneNumber: parsedData?.phone || '',
        email: parsedData?.email || '',
        linkedin: parsedData?.linkedin || '',
        skills: Array.isArray(parsedData?.skills) ? parsedData.skills.filter(Boolean) : [],
        collegeName: '',
        degree:
          Array.isArray(parsedData?.education) && parsedData.education.length > 0
            ? String(parsedData.education[0] || '')
            : '',
        branch: '',
        graduationDate: {
          month: '',
          year: '',
        },
        projects: normalizeProjects(parsedData?.projects || []),
        academicPerformance: undefined,
        hasInternshipExperience: false,
        targetRoles: [],
      };
      
      // Debug logging
      console.log('Parsed resume data:', {
        fullName: parsed.fullName,
        phoneNumber: parsed.phoneNumber,
        linkedin: parsed.linkedin,
        collegeName: parsed.collegeName,
        degree: parsed.degree,
        branch: parsed.branch,
        projectsCount: parsed.projects.length,
        hasAcademicPerformance: !!parsed.academicPerformance,
        hasInternshipExperience: parsed.hasInternshipExperience,
        targetRoles: parsed.targetRoles,
        skillsCount: parsed.skills.length,
      });
      const hasAnyParsedField = Boolean(
        parsed.fullName ||
          parsed.phoneNumber ||
          parsed.linkedin ||
          parsed.collegeName ||
          parsed.degree ||
          parsed.branch ||
          parsed.graduationDate?.month ||
          parsed.graduationDate?.year ||
            parsed.projects.length ||
            parsed.academicPerformance ||
            parsed.targetRoles.length ||
          parsed.skills.length
      );

      if (!hasAnyParsedField) {
        throw new Error('Could not extract details from this resume. Please try another PDF/DOCX format.');
      }

      setResumeSkills(parsed.skills);

      const existing: Partial<Step1Type> = onboardingData?.step1 ?? {};
      const next: Step1Type = {
        ...(existing as Step1Type),
        fullName: parsed.fullName || existing.fullName || '',
        phoneNumber: parsed.phoneNumber || existing.phoneNumber || '',
        linkedin: parsed.linkedin || existing.linkedin || '',
        email: parsed.email || existing.email || userEmail || '',
        graduationDate: {
          month: parsed.graduationDate?.month || existing.graduationDate?.month || '',
          year: parsed.graduationDate?.year || existing.graduationDate?.year || '',
        },
        yearOfStudy: existing.yearOfStudy || '1st',
        currentStatus: existing.currentStatus || 'Learning',
        collegeName: parsed.collegeName || existing.collegeName || '',
        customCollege: existing.customCollege || '',
        degree: parsed.degree || existing.degree || '',
        branch: parsed.branch || existing.branch || '',
      };

      // Detailed logging before saving
      console.log('Step1 data before updateStepData:', {
        parsed: {
          fullName: parsed.fullName,
          phoneNumber: parsed.phoneNumber,
          linkedin: parsed.linkedin,
          collegeName: parsed.collegeName,
          degree: parsed.degree,
          branch: parsed.branch,
        },
        toBeStored: {
          fullName: next.fullName,
          phoneNumber: next.phoneNumber,
          linkedin: next.linkedin,
          collegeName: next.collegeName,
          degree: next.degree,
          branch: next.branch,
        },
      });

      updateStepData(1, next);
      if (onboardingData?.currentStep === 1) {
        setCurrentStepData(next);
      }

      if (parsed.skills.length > 0) {
        const existingStep2: Partial<Step2Type> = onboardingData?.step2 ?? {};
        const nextStep2: Step2Type = {
          externalProjects:
            parsed.projects.length > 0
              ? parsed.projects
              : existingStep2.externalProjects || [],
          additionalSkills: existingStep2.additionalSkills || [],
          autoDetectedSkills: parsed.skills,
        };
        updateStepData(2, nextStep2);
      }

      const existingStep3: Partial<Step3Type> = onboardingData?.step3 ?? {};
      const nextStep3: Step3Type = {
        academicPerformance: parsed.academicPerformance || existingStep3.academicPerformance,
        workExperiences: existingStep3.workExperiences || [],
        competitiveProfiles: existingStep3.competitiveProfiles || [],
        hasInternshipExperience:
          parsed.hasInternshipExperience || existingStep3.hasInternshipExperience || false,
      };
      updateStepData(3, nextStep3);

      if ((parsed.targetRoles?.length || 0) > 0 || parsed.linkedin) {
        const existingStep4: Partial<Step4Type> = onboardingData?.step4 ?? {};
        const nextStep4: Step4Type = {
          targetRoles:
            parsed.targetRoles.length > 0
              ? parsed.targetRoles
              : existingStep4.targetRoles || [],
          locationPreferences: existingStep4.locationPreferences || {
            remote: true,
            cities: [],
          },
          salaryExpectations: existingStep4.salaryExpectations,
          linkedinUrl: parsed.linkedin || existingStep4.linkedinUrl || '',
          communicationPreferences: existingStep4.communicationPreferences || {
            email: true,
            whatsapp: true,
            phone: false,
          },
          allowCompaniesViewProfile: existingStep4.allowCompaniesViewProfile ?? true,
          consentTimestamp: existingStep4.consentTimestamp || new Date().toISOString(),
        };
        updateStepData(4, nextStep4);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse resume.';
      setResumeError(message);
      setResumeSkills([]);
    } finally {
      setIsParsingResume(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await processResumeFile(file, 'resume');
    event.target.value = '';
  };

  const handleLinkedinResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await processResumeFile(file, 'linkedin-pdf');
    event.target.value = '';
  };

  const handleBackClick = () => {
    // Save current step data before going back
    if (currentStepData && currentStep > 1) {
      updateStepData(currentStep, currentStepData);
    }
    goToPreviousStep();
    setShowAlert(false);
    // Clear current step data
    setCurrentStepData(null);
  };

  if (isLoading || !onboardingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your onboarding...</p>
        </div>
      </div>
    );
  }

  const currentStep = onboardingData.currentStep;
  const progressPercentage = (currentStep / 4) * 100;

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-background via-background to-muted">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Setup your Profile</h1>
              <p className="text-muted-foreground">Complete these steps to unlock job applications.</p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
              Step {currentStep} of 4
            </div>
          </div>
          
          {/* Step Navigation */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 1 ? 'text-primary' : currentStep > 1 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  BASICS
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  SKILLS & PROJECTS
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 3 ? 'text-primary' : currentStep > 3 ? 'text-muted-foreground' : 'text-muted-foreground/50'
                }`}>
                  Education & Experience
                </div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-xs font-semibold uppercase ${
                  currentStep === 4 ? 'text-primary' : 'text-muted-foreground/50'
                }`}>
                  PREFERENCES
                </div>
              </div>
            </div>
            {/* Segmented Progress Bar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 1 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(2)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 2 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(3)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 3 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
              <button
                type="button"
                onClick={() => goToStep(4)}
                className={`h-2 flex-1 rounded-full transition-colors cursor-pointer ${currentStep > 4 ? 'bg-primary hover:bg-primary/80' : 'bg-muted hover:bg-muted/80'}`}
              />
            </div>
          </div>
        </div>

        {/* Form Section - Single Card */}
        {currentStep === 1 && (
          <>
            {/* Auto-fill Options with Dotted Border */}
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5 mb-8 relative z-10">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
                  <p className="text-sm font-medium">Fast-track your profile</p>
                </div>
                <p className="text-xs text-muted-foreground">Auto-fill details using either method.</p>
              </div>

              <div className="flex items-stretch gap-3">
                {/* Upload Resume Card */}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleResumeUpload}
                    className="hidden"
                    id="resume-upload"
                    disabled={isParsingResume}
                  />
                  <label htmlFor="resume-upload" className="block h-full">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer h-full">
                      <div className="flex flex-col items-center justify-center text-center space-y-2 h-full">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Upload Resume</p>
                          <p className="text-xs text-muted-foreground">PDF / DOCX</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* OR Divider */}
                <div className="flex flex-col items-center justify-center px-2">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                    <span className="text-xs font-medium text-muted-foreground">OR</span>
                  </div>
                </div>

                {/* Import from LinkedIn */}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleLinkedinResumeUpload}
                    className="hidden"
                    id="linkedin-resume-upload"
                    disabled={isParsingResume}
                  />
                  <label htmlFor="linkedin-resume-upload" className="block h-full">
                    <div className="border-2 border-border rounded-lg p-4 bg-background hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer h-full">
                      <div className="flex flex-col items-center justify-center text-center h-full space-y-2">
                        <div className="w-9 h-9 rounded-md flex items-center justify-center bg-[#0A66C2]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-foreground text-center">Upload LinkedIn Resume</p>
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span>Downloaded LinkedIn PDF</span>
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="inline-flex items-center justify-center"
                                  aria-label="How to upload LinkedIn PDF"
                                >
                                  <Info className="w-4 h-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[260px] text-xs leading-relaxed">
                                First download your profile details as a PDF from LinkedIn, then upload that PDF here.
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-3 space-y-2 relative z-20">
                {isParsingResume && (
                  <p className="text-xs text-muted-foreground">Reading resume...</p>
                )}
                {!isParsingResume && resumeFileName && (
                  <p className="text-xs text-muted-foreground">Selected: {resumeFileName}</p>
                )}
                {resumeError && (
                  <Alert variant="destructive">
                    <AlertDescription className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      {resumeError}
                    </AlertDescription>
                  </Alert>
                )}
                {!resumeError && resumeSkills.length > 0 && (
                  <Alert>
                    <AlertDescription className="flex items-center gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Detected skills: {resumeSkills.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </>
        )}
        {currentStep === 2 && (
          <div className="flex items-center gap-2 mb-6">
            <div>
              <h3 className="text-2xl font-semibold">Skills & Projects</h3>
            </div>
          </div>
        )}
        <div className="mb-8">
            {currentStep === 1 && (
              <ProfileStep1Component
                initialData={onboardingData.step1}
                userEmail={userEmail}
                userFullName={userFullName}
                onNext={handleStep1Complete}
                onSkip={handleSkip}
                onFieldChange={(data) => handleAutoSave(1, data)}
              />
            )}

            {currentStep === 2 && (
              <ProfileStep2Component
                initialData={onboardingData.step2}
                onNext={handleStep2Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(2, data)}
              />
            )}

            {currentStep === 3 && (
              <ProfileStep3Component
                initialData={onboardingData.step3}
                onNext={handleStep3Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(3, data)}
              />
            )}

            {currentStep === 4 && (
              <ProfileStep4Component
                initialData={onboardingData.step4}
                onNext={handleStep4Complete}
                onSkip={handleSkip}
                onBack={handleBackClick}
                onFieldChange={(data) => handleAutoSave(4, data)}
              />
            )}
        </div>
        </div>
      </div>

      {/* Fixed Footer with Action Buttons */}
      <div className="flex-shrink-0 bg-background/80 backdrop-blur-md border-t border-border/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBackClick} type="button" className="flex-1 md:flex-none">
              Back
            </Button>
          )}
          <div className="flex-1"></div>
          {(currentStep === 2 || currentStep === 3) && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              type="button"
              className="flex-1 md:flex-none text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                form.requestSubmit();
              }
            }}
            disabled={isSavingStepData || isLearnerProfileSaving}
            className="flex-1 md:flex-none"
          >
            {isSavingStepData || isLearnerProfileSaving
              ? 'Saving...'
              : currentStep === 4
                ? 'Complete Setup'
                : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
