import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Check, Loader2, Target, Globe, DollarSign, MessageSquare } from 'lucide-react';
import type { OnboardingStep4 as Step4Type } from '@/lib/profile.types';
import { CAREER_ROLES, INDIAN_CITIES } from '@/lib/profile.mockData';
import { useLearnerRoles } from '@/hooks/useLearnerRoles';
import { useLearnerRemoteLocations } from '@/hooks/useLearnerRemoteLocations';

interface ProfileStep4Props {
  initialData?: Partial<Step4Type>;
  onNext: (data: Step4Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step4Type) => void;
  onTermsAgreementChange?: (isAgreed: boolean) => void;
}

export const ProfileStep4Component: React.FC<ProfileStep4Props> = ({
  initialData,
  onNext,
  onSkip,
  onBack,
  onFieldChange,
  onTermsAgreementChange,
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.targetRoles || []);
  const [customRole, setCustomRole] = useState('');
  const [remotePreference, setRemotePreference] = useState(initialData?.locationPreferences?.remote ?? true);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialData?.locationPreferences?.cities || []);
  const [customCity, setCustomCity] = useState('');
  const [internshipSalary, setInternshipSalary] = useState(initialData?.salaryExpectations?.internship || '');
  const [fullTimeSalary, setFullTimeSalary] = useState(initialData?.salaryExpectations?.fullTime || '');
  const [linkedInUrl, setLinkedInUrl] = useState(initialData?.linkedinUrl || '');
  const [isVerifyingLinkedIn, setIsVerifyingLinkedIn] = useState(false);
  const [linkedInVerified, setLinkedInVerified] = useState(false);
  const [emailPref, setEmailPref] = useState(initialData?.communicationPreferences?.email ?? true);
  const [whatsappPref, setWhatsappPref] = useState(initialData?.communicationPreferences?.whatsapp ?? false);
  const [phonePref, setPhonePref] = useState(initialData?.communicationPreferences?.phone ?? false);
  const [allowCompanies, setAllowCompanies] = useState(initialData?.allowCompaniesViewProfile ?? false);
  // Always initialize to false so users must explicitly agree each time
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { roles, loading: isRolesLoading } = useLearnerRoles();
  const { remoteLocations } = useLearnerRemoteLocations();

  // Combine API roles with mock data as fallback
  const availableRoles = (() => {
    // If we have API roles, use them
    if (roles.length > 0) {
      return roles.map(role => role.name);
    }
    // Fallback to mock data
    return CAREER_ROLES;
  })();

  const availableCities = (() => {
    const apiLocations = remoteLocations.map((location) => location.name);
    const hasApiLocations = apiLocations.length > 0;
    const source = hasApiLocations ? apiLocations : INDIAN_CITIES;

    return source.filter((location) => {
      const normalized = location.toLowerCase();
      return !normalized.includes('remote') && !normalized.includes('work from home') && !normalized.includes('wfh');
    });
  })();

  const visibleRoleOptions = useMemo(() => {
    const normalizedAvailable = new Set(availableRoles.map((role) => role.toLowerCase()));
    const missingSelectedRoles = selectedRoles.filter(
      (role) => role !== 'Other' && !normalizedAvailable.has(role.toLowerCase())
    );

    const merged = [...missingSelectedRoles, ...availableRoles];
    const seen = new Set<string>();

    return merged.filter((role) => {
      const normalized = role.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }, [availableRoles, selectedRoles]);

  const visibleCityOptions = useMemo(() => {
    const normalizedAvailable = new Set(availableCities.map((city) => city.toLowerCase()));
    const missingSelectedCities = selectedCities.filter(
      (city) => city !== 'Other' && !normalizedAvailable.has(city.toLowerCase())
    );

    const merged = [...missingSelectedCities, ...availableCities];
    const seen = new Set<string>();

    return merged.filter((city) => {
      const normalized = city.toLowerCase();
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
  }, [availableCities, selectedCities]);

  const internshipSalaryRanges = ['₹10–20k', '₹20–30k', '₹30–40k', '₹40k+'];
  const fullTimeSalaryRanges = ['₹3–5 LPA', '₹5–7 LPA', '₹7–10 LPA', '₹10+ LPA'];

  const totalRoles = selectedRoles.filter((role) => role !== 'Other').length + (customRole.trim() ? 1 : 0);
  const totalLocations =
    (remotePreference ? 1 : 0) +
    selectedCities.filter((city) => city !== 'Other').length +
    (selectedCities.includes('Other') && customCity.trim() ? 1 : 0);

  const validateLinkedInUrl = (url: string): boolean => {
    const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/i;
    return linkedInRegex.test(url);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (totalRoles === 0) {
      newErrors.roles = 'Select at least 1 role';
    }
    if (totalRoles > 5) {
      newErrors.roles = 'Select maximum 5 roles';
    }

    if (totalLocations === 0) {
      newErrors.locations = 'Select at least 1 location';
    }
    if (totalLocations > 6) {
      newErrors.locations = 'Select maximum 5 cities + Remote';
    }

    if (!emailPref && !whatsappPref && !phonePref) {
      newErrors.contactMethods = 'Select at least 1 contact method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleRole = (role: string) => {
    if (role === 'Other') {
      if (selectedRoles.includes('Other')) {
        setSelectedRoles((prev) => prev.filter((r) => r !== 'Other'));
        setCustomRole('');
      } else {
        setSelectedRoles((prev) => [...prev, 'Other']);
      }

      if (errors.roles) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.roles;
          return newErrors;
        });
      }
      return;
    }

    if (selectedRoles.includes(role)) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    } else if (totalRoles < 5) {
      setSelectedRoles((prev) => [...prev, role]);
    }
    // Clear errors if any
    if (errors.roles) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.roles;
        return newErrors;
      });
    }
  };

  const handleToggleCity = (city: string) => {
    if (city === 'Other') {
      if (selectedCities.includes('Other')) {
        setSelectedCities((prev) => prev.filter((c) => c !== 'Other'));
        setCustomCity('');
      } else if (selectedCities.filter((c) => c !== 'Other').length < 5) {
        setSelectedCities((prev) => [...prev, 'Other']);
      }
      return;
    }

    if (selectedCities.includes(city)) {
      setSelectedCities((prev) => prev.filter((c) => c !== city));
    } else if (selectedCities.length < 5) {
      setSelectedCities((prev) => [...prev, city]);
    }
  };

  const handleAddCustomCity = () => {
    if (customCity.trim() && selectedCities.length < 5 && !selectedCities.includes(customCity)) {
      setSelectedCities((prev) => [...prev, customCity]);
      setCustomCity('');
    }
  };

  const handleVerifyLinkedIn = async () => {
    if (!validateLinkedInUrl(linkedInUrl)) {
      setErrors((prev) => ({
        ...prev,
        linkedin: 'Invalid LinkedIn URL format',
      }));
      return;
    }

    setIsVerifyingLinkedIn(true);
    // Simulate API call to verify LinkedIn profile
    setTimeout(() => {
      setLinkedInVerified(true);
      setIsVerifyingLinkedIn(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const allRoles = [...selectedRoles.filter((role) => role !== 'Other'), customRole.trim()].filter(Boolean);
      const allLocations = [
        ...selectedCities.filter((city) => city !== 'Other'),
        ...(selectedCities.includes('Other') ? [customCity.trim()] : []),
      ].filter(Boolean);

      onNext({
        targetRoles: allRoles,
        locationPreferences: {
          remote: remotePreference,
          cities: allLocations,
        },
        salaryExpectations: {
          internship: internshipSalary || undefined,
          fullTime: fullTimeSalary || undefined,
        },
        linkedinUrl: '',
        communicationPreferences: {
          email: emailPref,
          whatsapp: whatsappPref,
          phone: phonePref,
        },
        termsAndCondition: termsAgreed,
        allowCompaniesViewProfile: allowCompanies,
        consentTimestamp: new Date().toISOString(),
      });
    }
  };

  const isMandatoryFieldsFilled =
    totalRoles >= 1 &&
    totalRoles <= 5 &&
    totalLocations >= 1 &&
    totalLocations <= 6;

  useEffect(() => {
    setSelectedRoles(initialData?.targetRoles || []);
    setCustomRole('');
    setRemotePreference(initialData?.locationPreferences?.remote ?? true);
    setSelectedCities(initialData?.locationPreferences?.cities || []);
    setCustomCity('');
    setInternshipSalary(initialData?.salaryExpectations?.internship || '');
    setFullTimeSalary(initialData?.salaryExpectations?.fullTime || '');
    setLinkedInUrl(initialData?.linkedinUrl || '');
    setLinkedInVerified(false);
    setEmailPref(initialData?.communicationPreferences?.email ?? true);
    setWhatsappPref(initialData?.communicationPreferences?.whatsapp ?? false);
    setPhonePref(initialData?.communicationPreferences?.phone ?? false);
    setAllowCompanies(initialData?.allowCompaniesViewProfile ?? false);
    // Always reset to false so users must explicitly agree
    setTermsAgreed(false);
  }, [initialData]);

  useEffect(() => {
    onTermsAgreementChange?.(termsAgreed);
  }, [termsAgreed, onTermsAgreementChange]);

  const handleEmailPreferenceChange = (checked: boolean) => {
    setEmailPref(checked);
    if (checked && errors.contactMethods) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.contactMethods;
        return newErrors;
      });
    }
  };

  const handleWhatsappPreferenceChange = (checked: boolean) => {
    setWhatsappPref(checked);
    if (checked && errors.contactMethods) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.contactMethods;
        return newErrors;
      });
    }
  };

  const handlePhonePreferenceChange = (checked: boolean) => {
    setPhonePref(checked);
    if (checked && errors.contactMethods) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.contactMethods;
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Career Goals Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">CAREER GOALS</h3>
          </div>
          <div className="space-y-6">
            {/* Target Roles */}
            <div className="space-y-4">
              <div>
                <Label className="font-medium text-sm tracking-wide text-left block">Target roles <span className="text-destructive">*</span></Label>
              </div>
              
              {isRolesLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">Loading available roles...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {(visibleRoleOptions.includes('Other') ? visibleRoleOptions : [...visibleRoleOptions, 'Other']).map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedRoles.includes(role)
                          ? 'bg-primary/5'
                          : 'bg-muted/30'
                      } ${!selectedRoles.includes(role) && totalRoles >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleToggleRole(role)}
                        disabled={!selectedRoles.includes(role) && totalRoles >= 5}
                        className="w-4 h-4 rounded accent-green-600"
                      />
                      <span className="text-sm font-medium text-muted-foreground">{role}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedRoles.includes('Other') && (
                <div className="space-y-2">
                  <Label className="font-medium text-sm tracking-wide text-left block">Custom Role</Label>
                  <Input
                    placeholder="Enter custom role"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    disabled={isRolesLoading}
                  />
                </div>
              )}

              {errors.roles && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.roles}
                </p>
              )}
            </div>

            {/* Location Preferences */}
            <div className="space-y-4">
              <div>
                <Label className="flex justify-start font-medium text-sm tracking-wide">Preferred location</Label>
              </div>

              {/* Remote Toggle as styled badge/button */}
              <div>
                <button
                  type="button"
                  onClick={() => setRemotePreference(!remotePreference)}
                  className={`flex justify-start px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                    remotePreference
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-muted/30 text-muted-foreground border border-border hover:border-primary/50'
                  }`}
                >
                  Open to Remote
                </button>
              </div>

              {/* Cities Grid */}
              <div className="grid grid-cols-3 gap-3">
                {(visibleCityOptions.includes('Other') ? visibleCityOptions : [...visibleCityOptions, 'Other']).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleToggleCity(city)}
                    disabled={!selectedCities.includes(city) && selectedCities.filter((c) => c !== 'Other').length >= 5}
                    className={`py-3 px-4 rounded-lg border font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedCities.includes(city)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              {selectedCities.includes('Other') && (
                <div className="space-y-2">
                  <Label className="font-medium text-sm tracking-wide text-left block">Custom Location</Label>
                  <Input
                    placeholder="Enter custom location"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                  />
                </div>
              )}

              {errors.locations && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.locations}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Expectations Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">SALARY EXPECTATIONS</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Internship Stipend */}
            <div className="space-y-2">
              <Label className="font-medium text-sm tracking-wide text-left block">Internship stipend</Label>
              <Select value={internshipSalary} onValueChange={setInternshipSalary}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  {internshipSalaryRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Full-Time CTC */}
            <div className="space-y-2">
              <Label className="font-medium text-sm tracking-wide text-left block">Full-time CTC</Label>
              <Select value={fullTimeSalary} onValueChange={setFullTimeSalary}>
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select Range" />
                </SelectTrigger>
                <SelectContent>
                  {fullTimeSalaryRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication & Consent Card */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="pb-6">
          <div className="flex items-center gap-2 mb-6 bg-muted -mx-6 px-6 py-3 rounded-t-md">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold uppercase tracking-wide">COMMUNICATION & CONSENT</h3>
          </div>
          <div className="space-y-6">
            {/* Preferred Contact Methods */}
            <div className="space-y-4">
              <Label className="font-medium text-sm tracking-wide text-left block">Preferred contact methods</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-pref"
                    checked={emailPref}
                    onCheckedChange={(checked) => handleEmailPreferenceChange(Boolean(checked))}
                  />
                  <label htmlFor="email-pref" className="text-sm font-medium cursor-pointer">
                    Email
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whatsapp-pref"
                    checked={whatsappPref}
                    onCheckedChange={(checked) => handleWhatsappPreferenceChange(Boolean(checked))}
                  />
                  <label htmlFor="whatsapp-pref" className="text-sm font-medium cursor-pointer">
                    Whatsapp
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="phone-pref"
                    checked={phonePref}
                    onCheckedChange={(checked) => handlePhonePreferenceChange(Boolean(checked))}
                  />
                  <label htmlFor="phone-pref" className="text-sm font-medium cursor-pointer">
                    Phone
                  </label>
                </div>
              </div>
              {errors.contactMethods && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.contactMethods}
                </p>
              )}
            </div>

            {/* Profile Visibility */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <Label className="font-medium text-sm tracking-wide text-left block">Profile visibility</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Allow hiring partners to view your profile and contact you for jobs.
                  </p>
                </div>
                <Switch
                  checked={allowCompanies}
                  onCheckedChange={setAllowCompanies}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Sharing Consent */}
      <Card className="border-border/50 bg-white/50 dark:bg-slate-950/50 backdrop-blur">
        <CardContent className="py-4">
          <div className="space-y-3">
            <Label htmlFor="terms-demo" className="font-medium text-sm tracking-wide text-left block">
              Terms &amp; Conditions
            </Label>
            <div
              id="terms-demo"
              className="min-h-[130px] max-h-[130px] overflow-y-auto rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-left block"
            >
              <p className="mb-3">
                <strong>1. Acceptance of Terms</strong>
                <br />
                By accessing or using Zuvy&apos;s platform, website, or any associated services, you agree to be
                bound by these Terms &amp; Conditions. If you do not agree to these terms, please do not use our
                services. These terms apply to all learners, organizations, and visitors who interact with Zuvy.
              </p>

              <p className="mb-3">
                <strong>2. Platform Use</strong>
                <br />
                Zuvy provides an intelligent learning management system and associated educational programs. You
                agree to use the platform solely for lawful purposes and in a manner that does not infringe upon
                the rights of others or restrict their use of the platform.
              </p>

              <p className="mb-3">
                You are responsible for maintaining the confidentiality of your account credentials and for all
                activity that occurs under your account.
              </p>

              <p className="mb-2">
                <strong>3. Operations Team Communications</strong>
                <br />
                By enrolling in any Zuvy program or course, you acknowledge and consent that Zuvy&apos;s Operations
                Team may reach out to you and fellow learners for course-related follow-ups. These communications
                are conducted to support your learning journey and may include, but are not limited to:
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>
                  <strong>Attendance:</strong> Follow-ups regarding session attendance, absences, and participation
                  tracking to help you stay on track with your learning schedule.
                </li>
                <li>
                  <strong>Scores &amp; Assessments:</strong> Communication regarding your assessment results,
                  performance feedback, and recommendations for improvement to support academic progress.
                </li>
                <li>
                  <strong>Job &amp; Internship Opportunities:</strong> Outreach regarding placement opportunities,
                  internship openings, hiring partner referrals, and career guidance relevant to your course and
                  skill level.
                </li>
              </ul>

              <p className="mb-3">
                These communications may be made via email, phone, WhatsApp, or other contact methods provided at
                the time of enrollment. You may opt out of non-essential communications at any time by contacting
                our team.
              </p>

              <p className="mb-3">
                <strong>4. Intellectual Property</strong>
                <br />
                All content on the Zuvy platform - including course materials, videos, assessments, logos, and
                software - is the intellectual property of Zuvy or its licensors. You may not reproduce,
                distribute, or create derivative works from any content without prior written permission.
              </p>

              <p className="mb-2">
                <strong>5. User Conduct</strong>
                <br />
                You agree not to:
              </p>
              <ul className="list-disc pl-5 mb-3 space-y-1">
                <li>Share your account credentials with others</li>
                <li>Upload or transmit any harmful, offensive, or unlawful content</li>
                <li>Attempt to gain unauthorized access to any part of the platform</li>
                <li>Use the platform for commercial purposes without authorization</li>
                <li>Interfere with the proper functioning of the platform or its services</li>
              </ul>

              <p className="mb-3">
                <strong>6. Limitation of Liability</strong>
                <br />
                Zuvy is not liable for any indirect, incidental, or consequential damages arising from your use of
                the platform. We do not guarantee specific outcomes such as job placement, salary increments, or
                course completion within a defined period, though we make every effort to support your success.
              </p>

              <p className="mb-3">
                <strong>7. Modifications to Terms</strong>
                <br />
                Zuvy reserves the right to update these Terms &amp; Conditions at any time. Changes will be
                communicated through the platform or via email. Continued use of our services after changes are
                posted constitutes acceptance of the revised terms.
              </p>

              <p>
                <strong>8. Contact</strong>
                <br />
                For questions regarding these Terms &amp; Conditions, please reach out to us at{' '}
                <a
                  href="https://navgurukul.notion.site/276a93c7c3918093b6eedc055b29eed2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Contact Us
                </a>
                .
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowCompanies-consent"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 rounded accent-green-600"
              />
              <label htmlFor="allowCompanies-consent" className="text-sm text-primary cursor-pointer">
                I agree to Zuvy&apos;s Terms &amp; Conditions and Privacy Policy.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default ProfileStep4Component;
