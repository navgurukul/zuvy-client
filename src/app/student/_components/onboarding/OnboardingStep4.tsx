import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Check, Loader2, Target, Globe, DollarSign, MessageSquare } from 'lucide-react';
import type { OnboardingStep4 as Step4Type } from '@/lib/onboarding.types';
import { CAREER_ROLES, INDIAN_CITIES } from '@/lib/onboarding.mockData';

interface OnboardingStep4Props {
  initialData?: Partial<Step4Type>;
  onNext: (data: Step4Type) => void;
  onSkip: () => void;
  onBack?: () => void;
  onFieldChange?: (data: Step4Type) => void;
}

export const OnboardingStep4Component: React.FC<OnboardingStep4Props> = ({
  initialData,
  onNext,
  onSkip,
  onBack,
  onFieldChange,
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const internshipSalaryRanges = ['₹10–20k', '₹20–30k', '₹30–40k', '₹40k+'];
  const fullTimeSalaryRanges = ['₹3–5 LPA', '₹5–7 LPA', '₹7–10 LPA', '₹10+ LPA'];

  const totalRoles = selectedRoles.length + (customRole ? 1 : 0);
  const totalLocations = (remotePreference ? 1 : 0) + selectedCities.length + (customCity ? 1 : 0);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles((prev) => prev.filter((r) => r !== role));
    } else if (totalRoles < 5) {
      setSelectedRoles((prev) => [...prev, role]);
    }
  };

  const handleAddCustomRole = () => {
    if (customRole.trim() && totalRoles < 5 && !selectedRoles.includes(customRole)) {
      setSelectedRoles((prev) => [...prev, customRole]);
      setCustomRole('');
    }
  };

  const handleToggleCity = (city: string) => {
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
      const allRoles = [...selectedRoles, customRole].filter(Boolean);
      const allLocations = [...selectedCities, customCity].filter(Boolean);

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
                <Label className="font-medium text-sm tracking-wide">Target roles <span className="text-destructive">*</span></Label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {CAREER_ROLES.map((role) => (
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
                <Label className="font-medium text-sm tracking-wide">Preferred location</Label>
              </div>

              {/* Remote Toggle as styled badge/button */}
              <div>
                <button
                  type="button"
                  onClick={() => setRemotePreference(!remotePreference)}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
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
                {INDIAN_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleToggleCity(city)}
                    disabled={!selectedCities.includes(city) && selectedCities.length >= 5}
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
              <Label className="font-medium text-sm tracking-wide">Internship stipend</Label>
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
              <Label className="font-medium text-sm tracking-wide">Full-time CTC</Label>
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
              <Label className="font-medium text-sm tracking-wide">Preferred contact methods</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="email-pref"
                    checked={emailPref}
                    onCheckedChange={(checked) => setEmailPref(checked as boolean)}
                  />
                  <label htmlFor="email-pref" className="text-sm font-medium cursor-pointer">
                    Email
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="whatsapp-pref"
                    checked={whatsappPref}
                    onCheckedChange={(checked) => setWhatsappPref(checked as boolean)}
                  />
                  <label htmlFor="whatsapp-pref" className="text-sm font-medium cursor-pointer">
                    Whatsapp
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="phone-pref"
                    checked={phonePref}
                    onCheckedChange={(checked) => setPhonePref(checked as boolean)}
                  />
                  <label htmlFor="phone-pref" className="text-sm font-medium cursor-pointer">
                    Phone
                  </label>
                </div>
              </div>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium text-sm tracking-wide">Profile visibility</Label>
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
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowCompanies-consent"
              checked={allowCompanies}
              onChange={(e) => setAllowCompanies(e.target.checked)}
              className="w-4 h-4 rounded accent-green-600"
            />
            <label htmlFor="allowCompanies-consent" className="text-sm text-primary cursor-pointer">
              I agree to Zuvy's Terms & Conditions and Privacy Policy.
            </label>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default OnboardingStep4Component;
