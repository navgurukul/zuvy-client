import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, ChevronDown, User, Phone, Mail, GraduationCap, Upload, Sparkles, Calendar } from 'lucide-react';
import type { OnboardingStep1 as Step1Type } from '@/lib/onboarding.types';
import { COLLEGES, DEGREES, BRANCHES_BY_DEGREE, MONTHS, getYearsArray, getBranchesByDegree } from '@/lib/onboarding.mockData';

interface OnboardingStep1Props {
  initialData?: Partial<Step1Type>;
  userEmail?: string;
  userFullName?: string;
  onNext: (data: Step1Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step1Type) => void;
}

export const OnboardingStep1Component: React.FC<OnboardingStep1Props> = ({
  initialData,
  userEmail = '',
  userFullName = '',
  onNext,
  onSkip,
  onBack,
  onFieldChange,
}) => {
  const [formData, setFormData] = useState<Step1Type>({
    fullName: initialData?.fullName || userFullName || '',
    email: initialData?.email || userEmail || '',
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
  const [filteredColleges, setFilteredColleges] = useState(COLLEGES);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [validations, setValidations] = useState<Record<string, boolean>>({});
  const [showGraduationDatePicker, setShowGraduationDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(formData.graduationDate.month || '');
  const [selectedYear, setSelectedYear] = useState<string>(formData.graduationDate.year || '');

  const collegeDropdownRef = useRef<HTMLDivElement>(null);
  const graduationDateDropdownRef = useRef<HTMLDivElement>(null);
  
  const years = getYearsArray();
  const branches = formData.degree ? getBranchesByDegree(formData.degree) : [];
  
  // Auto-save form data on change
  useEffect(() => {
    if (onFieldChange) {
      onFieldChange(formData);
    }
  }, [formData]);

  // Filter colleges based on search
  useEffect(() => {
    if (collegeSearch.trim()) {
      const filtered = COLLEGES.filter(
        (college) =>
          college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
          college.state.toLowerCase().includes(collegeSearch.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(COLLEGES);
    }
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

    if (!formData.branch) {
      newErrors.branch = 'Branch selection is required';
    }

    if (!formData.graduationDate.month) {
      newErrors.graduationMonth = 'Graduation month is required';
    }

    if (!formData.graduationDate.year) {
      newErrors.graduationYear = 'Graduation year is required';
    } else {
      const selectedDate = new Date(`${formData.graduationDate.month} 1, ${formData.graduationDate.year}`);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.graduationDate = 'Graduation date must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

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
    setShowCollegeDropdown(false);
    setCollegeSearch('');
  };

  const handleCustomCollege = () => {
    setFormData((prev) => ({
      ...prev,
      collegeName: '',
      customCollege: collegeSearch,
    }));
    setShowCollegeDropdown(false);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'degree') {
      setFormData((prev) => ({
        ...prev,
        degree: value,
        branch: '', // Reset branch when degree changes
      }));
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
              <Label htmlFor="fullName" className="font-medium">
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
              <Label htmlFor="phoneNumber" className="font-medium">
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
                    className={`rounded-l-none ${errors.phoneNumber ? 'border-destructive' : ''}`}
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
            <Label htmlFor="email" className="font-medium">
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
            <Label htmlFor="linkedin" className="font-medium">
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
                placeholder="linkedin.com/in/yourname"
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
                <Label htmlFor="college" className="font-medium">
                  College Name <span className="text-destructive">*</span>
                </Label>
                <div className="relative" ref={collegeDropdownRef}>
                  <Input
                    placeholder="Search college name or state..."
                    value={formData.collegeName || formData.customCollege || collegeSearch}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value);
                      setShowCollegeDropdown(true);
                      // Clear selected college when user types
                      if (formData.collegeName || formData.customCollege) {
                        setFormData((prev) => ({
                          ...prev,
                          collegeName: '',
                          customCollege: '',
                        }));
                      }
                    }}
                    onFocus={() => {
                      setShowCollegeDropdown(true);
                      // If college is already selected, clear it to show dropdown
                      if (formData.collegeName || formData.customCollege) {
                        setCollegeSearch('');
                      }
                    }}
                    className={errors.college ? 'border-destructive' : ''}
                  />
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />

                  {showCollegeDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                      {filteredColleges.map((college) => (
                        <button
                          key={college.id}
                          type="button"
                          onClick={() => handleCollegeSelect(college.name)}
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors"
                        >
                          <div className="font-medium">{college.name}</div>
                          <div className="text-xs text-muted-foreground">{college.state}</div>
                        </button>
                      ))}
                      {collegeSearch.trim() && filteredColleges.length === 0 && (
                        <button
                          type="button"
                          onClick={handleCustomCollege}
                          className="w-full text-left px-3 py-2 hover:bg-accent text-sm hover:text-accent-foreground transition-colors border-t border-border/30"
                        >
                          <div className="font-medium text-primary">Add "{collegeSearch}" as custom college</div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                  <Label htmlFor="degree" className="font-medium">
                    Degree
                  </Label>
                  <Select value={formData.degree || ''} onValueChange={(value) => handleSelectChange('degree', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Degree" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEGREES.map((degree) => (
                        <SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div className="space-y-2">
                  <Label htmlFor="branch" className="font-medium">
                    Branch <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.branch || ''} onValueChange={(value) => handleSelectChange('branch', value)}>
                    <SelectTrigger className={errors.branch ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length > 0 ? (
                        branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          Select a degree first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
                  <Label className="font-medium">
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
                  <Label className="font-medium">
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
                <Label className="font-medium">
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

export default OnboardingStep1Component;
