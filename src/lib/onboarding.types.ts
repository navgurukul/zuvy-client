// Onboarding Step 1 - Basic Information
export interface OnboardingStep1 {
  fullName: string;
  email: string;
  phoneNumber: string;
  linkedin?: string;
  collegeName: string;
  customCollege?: string;
  degree?: string;
  branch: string;
  yearOfStudy: '1st' | '2nd' | '3rd' | '4th';
  graduationDate: {
    month: string;
    year: string;
  };
  currentStatus: 'Learning' | 'Looking for Job' | 'Working';
}

// Onboarding Step 2 - External Projects & Skills
export interface ExternalProject {
  id: string;
  title: string;
  oneLineDescription: string;
  detailedDescription?: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  projectType: 'Solo' | 'Team';
  teamSize?: number;
  startDate?: { month: string; year: string };
  endDate?: { month: string; year: string };
}

export interface OnboardingStep2 {
  externalProjects: ExternalProject[];
  autoDetectedSkills: string[];
  additionalSkills: string[];
}

// Onboarding Step 3 - Education & Experience
export interface AcademicPerformance {
  marksFormat: 'CGPA' | 'Percentage';
  cgpa?: number;
  percentage?: number;
  class12Format?: 'CGPA' | 'Percentage';
  class12Percentage?: number;
  class12Board?: string;
  class10Format?: 'CGPA' | 'Percentage';
  class10Marks?: number;
  class10Board?: string;
  class10MarksOut?: '10' | '100';
}

export interface WorkExperience {
  id: string;
  companyName: string;
  role: string;
  startDate: { month: string; year: string };
  endDate?: { month: string; year: string };
  isCurrentlyWorking: boolean;
  workMode: 'Remote' | 'On-site';
  city?: string;
  responsibilities?: string;
  technologiesUsed?: string[];
}

export interface CompetitiveProfile {
  platform: 'LeetCode' | 'CodeChef' | 'Codeforces' | 'HackerRank' | 'GeeksforGeeks';
  username?: string;
  isVerified: boolean;
  problemsSolved?: number;
  rating?: number;
  lastVerifiedAt?: string;
}

export interface OnboardingStep3 {
  academicPerformance?: AcademicPerformance;
  workExperiences: WorkExperience[];
  competitiveProfiles: CompetitiveProfile[];
  hasInternshipExperience: boolean;
}

// Onboarding Step 4 - Career Preferences
export interface OnboardingStep4 {
  targetRoles: string[];
  locationPreferences: {
    remote: boolean;
    cities: string[];
  };
  salaryExpectations?: {
    internship?: string;
    fullTime?: string;
  };
  linkedinUrl: string;
  communicationPreferences: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
  };
  allowCompaniesViewProfile: boolean;
  consentTimestamp: string;
}

// Complete Onboarding Data
export interface OnboardingData {
  userId?: string;
  step1?: OnboardingStep1;
  step2?: OnboardingStep2;
  step3?: OnboardingStep3;
  step4?: OnboardingStep4;
  currentStep: number;
  isCompleted: boolean;
  hasSkipped: boolean;
  lastUpdated: string;
  completedAt?: string;
}

// User Profile (combined view)
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  collegeInfo: {
    name: string;
    degree?: string;
    branch: string;
    yearOfStudy: string;
    graduationDate: string;
  };
  externalProjects: ExternalProject[];
  skills: string[];
  academicPerformance?: AcademicPerformance;
  workExperiences: WorkExperience[];
  competitiveProfiles: CompetitiveProfile[];
  targetRoles: string[];
  locationPreferences: {
    remote: boolean;
    cities: string[];
  };
  salaryExpectations?: {
    internship?: string;
    fullTime?: string;
  };
  linkedinUrl: string;
  communicationPreferences: {
    email: boolean;
    whatsapp: boolean;
    phone: boolean;
  };
  allowCompaniesViewProfile: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
