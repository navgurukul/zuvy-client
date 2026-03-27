import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, AlertCircle, ChevronDown, User, Phone, Mail, GraduationCap } from 'lucide-react';
import type { OnboardingStep1 as Step1Type } from '@/lib/profile.types';
import { MONTHS, getYearsArray, getBranchesByDegree } from '@/lib/profile.mockData';
import { useLearnerDegreeDetails } from '@/hooks/useLearnerDegreeDetails';
import { useLearnerBranchDetails } from '@/hooks/useLearnerBranchDetails';
import { getUser } from '@/store/store';

interface ProfileStep1Props {
  initialData?: Partial<Step1Type>;
  userEmail?: string;
  userFullName?: string;
  onNext: (data: Step1Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step1Type) => void;
}

export const ProfileStep1Component: React.FC<ProfileStep1Props> = ({
  initialData,
  userEmail = '',
  userFullName = '',
  onNext,
  onSkip,
  onBack,
  onFieldChange,
}) => {
  const { user } = getUser();
  const loggedInName = user?.name?.trim() || '';
  const loggedInEmail = user?.email?.trim() || '';
  const resolvedUserFullName = userFullName?.trim() || loggedInName;
  const resolvedUserEmail = userEmail?.trim() || loggedInEmail;

  const [formData, setFormData] = useState<Step1Type>({
    fullName: initialData?.fullName || resolvedUserFullName || '',
    email: resolvedUserEmail || initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    linkedin: initialData?.linkedin || '',
    collegeName: initialData?.collegeName || '',
    customCollege: initialData?.customCollege || '',
    degree: initialData?.degree || '',
    branch: initialData?.branch || '',
    yearOfStudy: initialData?.yearOfStudy || '1st',
    graduationDate: initialData?.graduationDate || { month: '', year: '' },
    currentStatus: initialData?.currentStatus || 'Learning',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [collegeSearch, setCollegeSearch] = useState('');
  const [filteredColleges, setFilteredColleges] = useState<{ name: string; state: string }[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [validations, setValidations] = useState<Record<string, boolean>>({});
  const [showGraduationDatePicker, setShowGraduationDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(formData.graduationDate.month || '');
  const [selectedYear, setSelectedYear] = useState<string>(formData.graduationDate.year || '');
  const [customDegree, setCustomDegree] = useState<string>('');
  const [customBranch, setCustomBranch] = useState<string>('');
  const fullNameEditedRef = useRef(false);

  useEffect(() => {
    const nextEmail = resolvedUserEmail || initialData?.email || '';
    if (!nextEmail) return;

    setFormData((prev) => {
      if (prev.email === nextEmail) {
        return prev;
      }
      return { ...prev, email: nextEmail };
    });
  }, [resolvedUserEmail, initialData?.email]);

  useEffect(() => {
    const nextFullName = initialData?.fullName?.trim() || resolvedUserFullName;
    if (!nextFullName) return;

    setFormData((prev) => {
      // Only autofill name when the field is still empty.
      if (fullNameEditedRef.current || prev.fullName?.trim()) {
        return prev;
      }
      return { ...prev, fullName: nextFullName };
    });
  }, [resolvedUserFullName, initialData?.fullName]);

  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const graduationDateDropdownRef = useRef<HTMLDivElement>(null);
  const { degreeDetails, loading: isDegreeLoading } = useLearnerDegreeDetails();
  const { branchDetails, loading: isBranchLoading } = useLearnerBranchDetails();
  
  const years = getYearsArray(1990);
  const degreeOptions = degreeDetails.map((item) => item.name);
  const branchOptions = branchDetails.map((item) => item.name);
  
  // Handle branches from API with fallback to mock data
  const branches = (() => {
    // If we have API branch data, use it
    if (branchDetails.length > 0) {
      return branchOptions;
    }
    
    // Fallback to degree-specific branches from mock data
    const currentDegree = formData.degree;
    if (!currentDegree || currentDegree === 'Other') return [];
    
    const selectedDegreeDetails = degreeDetails.find((item) => item.name === currentDegree);
    return selectedDegreeDetails?.branches?.length
      ? selectedDegreeDetails.branches
      : getBranchesByDegree(currentDegree);
  })();
  
  // Handle custom degree initialization
  useEffect(() => {
    // Prevent infinite loops by checking if degreeOptions is loaded and degree exists
    if (degreeDetails.length > 0 && formData.degree && formData.degree !== 'Other') {
      const isCustomDegree = !degreeOptions.includes(formData.degree);
      if (isCustomDegree && customDegree !== formData.degree) {
        setCustomDegree(formData.degree);
      }
    }
  }, [degreeDetails, formData.degree, degreeOptions, customDegree]);

  // Handle custom branch initialization
  useEffect(() => {
    // Prevent infinite loops by checking if branchOptions is loaded and branch exists
    if (branchDetails.length > 0 && formData.branch && formData.branch !== 'Other') {
      const isCustomBranch = !branchOptions.includes(formData.branch);
      if (isCustomBranch && customBranch !== formData.branch) {
        setCustomBranch(formData.branch);
      }
    }
  }, [branchDetails, formData.branch, branchOptions, customBranch]);
  
  // Auto-save form data on change
  useEffect(() => {
    if (onFieldChange) {
      onFieldChange(formData);
    }
  }, [formData]);

  const lastAutofillRef = useRef<string>('');

  useEffect(() => {
    if (!initialData) {
      console.log('ProfileStep1: initialData is empty, skipping autofill');
      return;
    }
    
    const signature = [
      initialData.fullName ?? '',
      initialData.phoneNumber ?? '',
      initialData.linkedin ?? '',
      initialData.collegeName ?? '',
      initialData.customCollege ?? '',
      initialData.degree ?? '',
      initialData.branch ?? '',
      initialData.graduationDate?.month ?? '',
      initialData.graduationDate?.year ?? '',
      initialData.yearOfStudy ?? '',
      initialData.currentStatus ?? '',
    ].join('|');
    if (signature === lastAutofillRef.current) {
      console.log('ProfileStep1: initialData unchanged, skipping autofill');
      return;
    }

    // Debug log with full initialData details
    console.log('ProfileStep1 autofill triggered:', {
      fullName: initialData.fullName,
      phoneNumber: initialData.phoneNumber,
      linkedin: initialData.linkedin,
      collegeName: initialData.collegeName,
      customCollege: initialData.customCollege,
      degree: initialData.degree,
      branch: initialData.branch,
      yearOfStudy: initialData.yearOfStudy,
      currentStatus: initialData.currentStatus,
      graduationDate: initialData.graduationDate,
    });

    setFormData((prev) => {
      const next = { ...prev };
      let changed = false;
      
      // Update if value exists and is different
      if (!fullNameEditedRef.current && initialData.fullName && initialData.fullName !== prev.fullName) {
        next.fullName = initialData.fullName;
        changed = true;
      }
      if (initialData.phoneNumber && initialData.phoneNumber !== prev.phoneNumber) {
        next.phoneNumber = initialData.phoneNumber;
        changed = true;
      }
      if (initialData.linkedin && initialData.linkedin !== prev.linkedin) {
        next.linkedin = initialData.linkedin;
        changed = true;
      }
      if (initialData.collegeName && initialData.collegeName !== prev.collegeName) {
        next.collegeName = initialData.collegeName;
        changed = true;
      }
      if (initialData.customCollege && initialData.customCollege !== prev.customCollege) {
        next.customCollege = initialData.customCollege;
        changed = true;
      }
      if (initialData.degree && initialData.degree !== prev.degree) {
        next.degree = initialData.degree;
        changed = true;
      }
      if (initialData.branch && initialData.branch !== prev.branch) {
        next.branch = initialData.branch;
        changed = true;
      }
      if (initialData.yearOfStudy && initialData.yearOfStudy !== prev.yearOfStudy) {
        next.yearOfStudy = initialData.yearOfStudy as any;
        changed = true;
      }
      if (initialData.currentStatus && initialData.currentStatus !== prev.currentStatus) {
        next.currentStatus = initialData.currentStatus as any;
        changed = true;
      }

      if (initialData.graduationDate?.month && initialData.graduationDate.month !== prev.graduationDate.month) {
        next.graduationDate = {
          ...next.graduationDate,
          month: initialData.graduationDate.month,
        };
        changed = true;
      }
      if (initialData.graduationDate?.year && initialData.graduationDate.year !== prev.graduationDate.year) {
        next.graduationDate = {
          ...next.graduationDate,
          year: initialData.graduationDate.year,
        };
        changed = true;
      }

      if (!changed) {
        return prev;
      }
      
      console.log('ProfileStep1 formData updated:', {
        fullName: next.fullName,
        phoneNumber: next.phoneNumber,
        linkedin: next.linkedin,
        collegeName: next.collegeName,
        degree: next.degree,
        branch: next.branch,
      });
      
      return next;
    });

    if (initialData.phoneNumber) {
      setValidations((prev) => ({
        ...prev,
        phoneNumber: validatePhoneNumber(initialData.phoneNumber as string),
      }));
    }

    lastAutofillRef.current = signature;
  }, [initialData]);

  // Filter colleges based on search
 useEffect(() => {
  const fetchColleges = async () => {
    if (!collegeSearch.trim()) {
      setFilteredColleges([]);
      return;
    }

    setIsLoadingColleges(true);
    try {
      const res = await fetch(
        `http://universities.hipolabs.com/search?country=India&name=${encodeURIComponent(collegeSearch)}`
      );
      const data = await res.json();
      const mapped = data.map((u: any) => ({
        name: u.name,
        state: u['state-province'] || 'India',
      }));
      setFilteredColleges(mapped);
    } catch (err) {
      console.error('Failed to fetch colleges:', err);
      setFilteredColleges([]);
    } finally {
      setIsLoadingColleges(false);
    }
  };

  // Debounce to avoid hammering the API
  const debounce = setTimeout(fetchColleges, 400);
  return () => clearTimeout(debounce);
}, [collegeSearch]);

  // Close college dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
        setShowCollegeDropdown(false);
      }
    };

    if (showCollegeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCollegeDropdown]);

  // Close graduation date dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (graduationDateDropdownRef.current && !graduationDateDropdownRef.current.contains(event.target as Node)) {
        setShowGraduationDatePicker(false);
      }
    };

    if (showGraduationDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGraduationDatePicker]);

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!(formData.linkedin ?? '').trim()) {
      newErrors.linkedin = 'LinkedIn Profile is required';
    }

    if (!formData.collegeName && !formData.customCollege) {
      newErrors.college = 'College selection is required';
    }

    if (!(formData.degree ?? '').trim()) {
      newErrors.degree = 'Degree selection is required';
    }

    if (!formData.branch) {
      newErrors.branch = 'Branch selection is required';
    }

    if (!formData.graduationDate.month && !formData.graduationDate.year) {
      newErrors.graduationDate = 'Graduation month and year are required';
    } else if (!formData.graduationDate.month) {
      newErrors.graduationDate = 'Graduation month is required';
    } else if (!formData.graduationDate.year) {
      newErrors.graduationDate = 'Graduation year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'fullName') {
      fullNameEditedRef.current = true;
    }

    // Format phone number
    if (name === 'phoneNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
      if (processedValue.length === 10) {
        setValidations((prev) => ({ ...prev, phoneNumber: validatePhoneNumber(processedValue) }));
      } else {
        setValidations((prev) => ({ ...prev, phoneNumber: false }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCollegeSelect = (collegeName: string) => {
    setFormData((prev) => ({
      ...prev,
      collegeName,
      customCollege: '',
    }));
    if (errors.college) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.college;
        return next;
      });
    }
    setShowCollegeDropdown(false);
    setCollegeSearch('');
  };

  const handleCustomCollege = () => {
    setFormData((prev) => ({
      ...prev,
      collegeName: '',
      customCollege: collegeSearch,
    }));
    if (errors.college) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.college;
        return next;
      });
    }
    setCollegeSearch('');
    setShowCollegeDropdown(false);
  };

  const clearSelectedCollege = () => {
    setFormData((prev) => ({
      ...prev,
      collegeName: '',
    }));
  };

  const clearManualCollege = () => {
    setFormData((prev) => ({
      ...prev,
      customCollege: '',
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'degree') {
      if (value === 'Other') {
        // When "Other" is selected, keep the dropdown value as "Other"
        setFormData((prev) => ({
          ...prev,
          degree: 'Other',
          branch: '', // Reset branch when degree changes
        }));
        // Don't clear customDegree here - let user continue typing
      } else {
        // When a predefined degree is selected
        setFormData((prev) => ({
          ...prev,
          degree: value,
          branch: '', // Reset branch when degree changes
        }));
        // Clear custom degree when switching to a predefined option
        setCustomDegree('');
      }
      if (errors.degree || errors.branch) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.degree;
          delete next.branch;
          return next;
        });
      }
    } else if (name === 'branch') {
      if (!(formData.degree ?? '').trim()) {
        setErrors((prev) => ({
          ...prev,
          degree: 'Please select degree first',
          branch: 'Please select degree first',
        }));
        return;
      }

      if (value === 'Other') {
        // When "Other" is selected for branch, keep the dropdown value as "Other"
        setFormData((prev) => ({
          ...prev,
          branch: 'Other',
        }));
        // Don't clear customBranch here - let user continue typing
      } else {
        // When a predefined branch is selected
        setFormData((prev) => ({
          ...prev,
          branch: value,
        }));
        // Clear custom branch when switching to a predefined option
        setCustomBranch('');
      }
      if (errors.branch) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.branch;
          return next;
        });
      }
    } else if (name === 'graduationMonth' || name === 'graduationYear') {
      setFormData((prev) => ({
        ...prev,
        graduationDate: {
          ...prev.graduationDate,
          [name === 'graduationMonth' ? 'month' : 'year']: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear related errors
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCustomDegreeChange = (value: string) => {
    setCustomDegree(value);
    // Always update form data when typing in custom field
    setFormData((prev) => ({
      ...prev,
      degree: value.trim() || 'Other', // Use the custom value or fallback to "Other"
    }));
  };

  const handleCustomBranchChange = (value: string) => {
    setCustomBranch(value);
    // Always update form data when typing in custom field
    setFormData((prev) => ({
      ...prev,
      branch: value.trim() || 'Other', // Use the custom value or fallback to "Other"
    }));
  };

  const hasSelectedDegree = Boolean((formData.degree ?? '').trim());

  const handleGraduationDateSave = () => {
    if (selectedMonth && selectedYear) {
      setFormData((prev) => ({
        ...prev,
        graduationDate: {
          month: selectedMonth,
          year: selectedYear,
        },
      }));
      // Clear error if exists
      if (errors.graduationDate) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.graduationDate;
          return newErrors;
        });
      }
      // Close the popover
      setTimeout(() => setShowGraduationDatePicker(false), 100);
    }
  };

  const handleGraduationDateClear = () => {
    setSelectedMonth('');
    setSelectedYear('');
    setFormData((prev) => ({
      ...prev,
      graduationDate: { month: '', year: '' },
    }));
  };

  const handleGraduationDateThisMonth = () => {
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const currentYear = now.getFullYear().toString();
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext(formData);
    }
  };

  // Check if mandatory fields are filled (for Skip button)
  const isMandatoryFieldsFilled =
    formData.fullName &&
    formData.phoneNumber &&
    validatePhoneNumber(formData.phoneNumber) &&
    (formData.collegeName || formData.customCollege) &&
    formData.branch;

  const hasSelectedCollege = Boolean(formData.collegeName?.trim());
  const hasManualCollege = Boolean(formData.customCollege?.trim());
  const isSearchCollegeDisabled = hasManualCollege;
  const isManualCollegeDisabled = hasSelectedCollege;

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Details Card */}
        <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
          <CardContent className="pb-6">
            <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold uppercase tracking-wide">PERSONAL DETAILS</h3>
            </div>
            <div className="space-y-6">
              {/* Row 1: Full Name and Phone Number */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-medium text-left block">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Aditya Kumar"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="font-medium text-left block">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex">
                    <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground border-input">
                      <Phone className="w-4 h-4 mr-2" />
                      <span className="text-sm">+91</span>
                    </div>
                    <div className="relative flex-1">
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        placeholder="9999999999"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        maxLength={10}
                        className={`rounded-l-none mt-0 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                      />
                      {validations.phoneNumber && formData.phoneNumber.length === 10 && (
                        <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success w-5 h-5" />
                      )}
                    </div>
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-left block">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="aditya.student@zuvy.org"
                    value={formData.email}
                    disabled
                    className="pl-10 bg-muted"
                  />
                </div>
              </div>

              {/* Row 3: LinkedIn Profile - Full Width */}
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="font-medium text-left block">
                  LinkedIn Profile <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    placeholder="https://www.linkedin.com/in/yourname"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
                {errors.linkedin && (
                  <p className="text-sm text-destructive">{errors.linkedin}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Card */}
        <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
          <CardContent className="pb-6">
            <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold uppercase tracking-wide">EDUCATION</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="college" className="font-medium text-left block">
                  College Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative" ref={collegeDropdownRef}>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full" tabIndex={isSearchCollegeDisabled ? 0 : -1}>
                          <Input
                            placeholder="Search college name or state..."
                            value={formData.collegeName || collegeSearch}
                            disabled={isSearchCollegeDisabled}
                            onChange={(e) => {
                              if (isSearchCollegeDisabled) {
                                return;
                              }
                              setCollegeSearch(e.target.value);
                              setShowCollegeDropdown(true);
                              // Clear selected college when user types
                              if (formData.collegeName) {
                                setFormData((prev) => ({
                                  ...prev,
                                  collegeName: '',
                                }));
                              }
                            }}
                            onFocus={() => {
                              if (isSearchCollegeDisabled) {
                                return;
                              }
                              setShowCollegeDropdown(true);
                              // If college is already selected, clear search keyword and keep selected value
                              if (formData.collegeName) {
                                setCollegeSearch('');
                              }
                            }}
                            className={errors.college ? 'border-destructive' : ''}
                          />
                        </div>
                      </TooltipTrigger>
                      {isSearchCollegeDisabled && (
                        <TooltipContent>
                          <p>Clear manual college first to search from dropdown.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
{showCollegeDropdown && !isSearchCollegeDisabled && (
  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
    
    {/* Loading state */}
    {isLoadingColleges && (
      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
        Searching colleges...
      </div>
    )}

    {/* Empty state before typing */}
    {!isLoadingColleges && !collegeSearch.trim() && (
      <div className="px-3 py-4 text-sm text-muted-foreground text-center">
        Start typing to search colleges
      </div>
    )}

    {/* Results */}
    {!isLoadingColleges && filteredColleges.map((college, index) => (
      <button
        key={index}
        type="button"
        onClick={() => handleCollegeSelect(college.name)}
        className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors"
      >
        <div className="font-medium">{college.name}</div>
        <div className="text-xs text-muted-foreground">{college.state}</div>
      </button>
    ))}

    {/* No results + custom add */}
    {!isLoadingColleges && collegeSearch.trim() && filteredColleges.length === 0 && (
      <button
        type="button"
        onClick={handleCustomCollege}
        className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors"
      >
        <div className="font-medium text-primary">Add &quot;{collegeSearch}&quot; as custom college</div>
      </button>
    )}
  </div>
)}
                </div>

                {hasSelectedCollege && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearSelectedCollege}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear selected college
                    </button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">OR</p>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-full" tabIndex={isManualCollegeDisabled ? 0 : -1}>
                        <Input
                          placeholder="Enter college name manually"
                          value={formData.customCollege}
                          disabled={isManualCollegeDisabled}
                          onChange={(e) => {
                            if (isManualCollegeDisabled) {
                              return;
                            }
                            const value = e.target.value;
                            setShowCollegeDropdown(false);
                            setCollegeSearch('');
                            setFormData((prev) => ({
                              ...prev,
                              collegeName: '',
                              customCollege: value,
                            }));
                            if (errors.college) {
                              setErrors((prev) => {
                                const next = { ...prev };
                                delete next.college;
                                return next;
                              });
                            }
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    {isManualCollegeDisabled && (
                      <TooltipContent>
                        <p>Clear selected college first to enter manually.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {hasManualCollege && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearManualCollege}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear manual college
                    </button>
                  </div>
                )}

                {errors.college && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.college}
                  </p>
                )}
            </div>

              {/* Row: Degree and Branch */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Degree */}
                <div className="space-y-2">
                  <Label htmlFor="degree" className="font-medium text-left block">
                    Degree <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={(() => {
                      const degree = formData.degree ?? '';
                      // If it's empty, return empty
                      if (!degree) return '';
                      // Preserve previously selected degree while options are still loading
                      if (degreeOptions.length === 0) return degree;
                      // If it's a predefined degree, show it
                      if (degreeOptions.includes(degree)) return degree;
                      // If it's a custom degree, always show 'Other' in dropdown
                      return 'Other';
                    })()} 
                    onValueChange={(value) => handleSelectChange('degree', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.degree &&
                        formData.degree !== 'Other' &&
                        !isDegreeLoading &&
                        !degreeOptions.includes(formData.degree) && (
                          <SelectItem value={formData.degree}>{formData.degree}</SelectItem>
                        )}
                      {isDegreeLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading degrees...
                        </SelectItem>
                      ) : degreeOptions.length > 0 ? (
                        degreeOptions.map((degree) => (
                          <SelectItem key={degree} value={degree}>
                            {degree}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-degrees" disabled>
                          No degrees available
                        </SelectItem>
                      )}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.degree && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.degree}
                    </p>
                  )}
                  
                  {/* Custom Degree Input - Show when "Other" is selected */}
                  {(formData.degree === 'Other' || (formData.degree && !degreeOptions.includes(formData.degree))) && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter your degree name"
                        value={customDegree}
                        onChange={(e) => handleCustomDegreeChange(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch" className="font-medium text-left block">
                    Branch <span className="text-destructive">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <Select 
                            value={(() => {
                              const branch = formData.branch ?? '';
                              // If it's empty, return empty
                              if (!branch) return '';
                              // Preserve previously selected branch while options are still loading
                              if (branches.length === 0) return branch;
                              // If it's a predefined branch (either API or mock data), show it
                              if (branches.includes(branch)) return branch;
                              // If it's a custom branch, always show 'Other' in dropdown
                              return 'Other';
                            })()} 
                            onValueChange={(value) => handleSelectChange('branch', value)}
                            disabled={!hasSelectedDegree}
                          >
                            <SelectTrigger className={errors.branch ? 'border-destructive' : ''}>
                              <SelectValue placeholder={hasSelectedDegree ? 'Select Branch' : 'Select degree first'} />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.branch &&
                                formData.branch !== 'Other' &&
                                !isBranchLoading &&
                                !branches.includes(formData.branch) && (
                                  <SelectItem value={formData.branch}>{formData.branch}</SelectItem>
                                )}
                              {isBranchLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading branches...
                                </SelectItem>
                              ) : branches.length > 0 ? (
                                <>
                                  {branches.map((branch) => (
                                    <SelectItem key={branch} value={branch}>
                                      {branch}
                                    </SelectItem>
                                  ))}
                                  {/* Only show "Other" option if it's not already in the API data */}
                                  {!branches.includes('Other') && (
                                    <SelectItem value="Other">
                                      Other
                                    </SelectItem>
                                  )}
                                </>
                              ) : (
                                <SelectItem value="none" disabled>
                                  {formData.degree ? 'No branches available' : 'Select a degree first'}
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      {!hasSelectedDegree && (
                        <TooltipContent>
                          <p>Please select degree first</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  
                  {/* Custom Branch Input - Show when "Other" is selected or custom branch */}
                  {(formData.branch === 'Other' || (formData.branch && !branches.includes(formData.branch))) && (
                    <div className="mt-2">
                      <Input
                        placeholder="Enter your branch name"
                        value={customBranch}
                        onChange={(e) => handleCustomBranchChange(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {errors.branch && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.branch}
                    </p>
                  )}
                </div>
              </div>

              {/* Row: Year of Study and Graduation Date */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Year of Study */}
                <div className="space-y-2">
                  <Label className="font-medium text-left block">
                    Year of Study <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {['1st', '2nd', '3rd', '4th'].map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, yearOfStudy: year as any }))}
                        className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all ${
                          formData.yearOfStudy === year
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:border-primary'
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Graduation Date */}
                <div className="space-y-2">
                  <Label className="font-medium text-left block">
                    Graduation Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={formData.graduationDate.month}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          graduationDate: {
                            ...prev.graduationDate,
                            month: value,
                          },
                        }));
                        if (errors.graduationDate) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.graduationDate;
                            return next;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={errors.graduationDate ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={formData.graduationDate.year}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          graduationDate: {
                            ...prev.graduationDate,
                            year: value,
                          },
                        }));
                        if (errors.graduationDate) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.graduationDate;
                            return next;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className={errors.graduationDate ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.graduationDate && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.graduationDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div className="space-y-2">
                <Label className="font-medium text-left block">
                  Current Status <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {['Learning', 'Looking for Job', 'Working'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, currentStatus: status as any }))}
                      className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all ${
                        formData.currentStatus === status
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background hover:border-primary'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </>
  );
};

export default ProfileStep1Component;
