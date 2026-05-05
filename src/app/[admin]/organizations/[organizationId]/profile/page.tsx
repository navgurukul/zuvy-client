'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { Button } from '@/components/ui/button'
import { useGetMentorProfile } from '@/hooks/useGetMentorProfile'
import { useUpdateMentorProfile } from '@/hooks/useUpdateMentorProfile'
import { useBootcamps } from '@/hooks/useBootcamps'
import { toast } from '@/components/ui/use-toast'

type ProfileData = {
  title: string
  bio: string
  pastExperiences: string
  expertise: string[]
}

const SUGGESTED_EXPERTISE = [
  'Frontend Development',
  'Backend Engineering',
  'System Design',
  'Data Science',
  'Machine Learning',
  'Career Coaching',
  'Interview Prep',
  'Product Management',
  'Node.js',
  'NestJS',
  'PostgreSQL',
  'Backend Architecture',
]

type MentorProfileCreateUIProps = {
  initial?: ProfileData
  onBack?: () => void
  onValidSubmit?: (data: ProfileData) => Promise<void> | void
}

function MentorProfileCreateUI({
  initial = { title: '', bio: '', pastExperiences: '', expertise: [] },
  onBack,
  onValidSubmit,
}: MentorProfileCreateUIProps) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const { organizationId } = params
  const { courses, loading: bootcampsLoading } = useBootcamps({
    limit: 1000,
    searchTerm: '',
    offset: 0,
    auto: true,
  })
  const mentorshipEnabledBootcamp = useMemo(
    () => courses.find((course) => course.mentorshipEnabled),
    [courses]
  )
  const bootcampId = mentorshipEnabledBootcamp?.id ?? null
  const hasResolvedBootcamp =
    typeof bootcampId === 'number' && Number.isFinite(bootcampId) && bootcampId > 0

  const {
    mentorProfile,
    loading,
    error: apiError,
    completenessGate,
    refetchMentorProfile,
  } = useGetMentorProfile()
  const {
    updateMentorProfile,
    loading: updating,
    error: updateError,
  } = useUpdateMentorProfile()
  const [title, setTitle] = useState(initial.title)
  const [bio, setBio] = useState(initial.bio)
  const [pastExperiences, setPastExperiences] = useState(initial.pastExperiences)
  const [expertise, setExpertise] = useState<string[]>(initial.expertise)
  const [tagInput, setTagInput] = useState('')

  const tagRef = useRef<HTMLInputElement>(null)
  const orgId = Array.isArray(organizationId) ? organizationId[0] : organizationId
  const roleSegment = pathname.split('/')[1] || 'admin'
  const coursesHref = orgId
    ? `/${roleSegment}/organizations/${orgId}/courses`
    : `/${roleSegment}/organizations`

  // Initialize form with mentor profile data
  useEffect(() => {
    if (mentorProfile) {
      setTitle(mentorProfile.title || '')
      setBio(mentorProfile.bio || '')
      setPastExperiences(mentorProfile.pastExperiences || '')
      setExpertise(mentorProfile.expertise || [])
    }
  }, [mentorProfile])

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').trim()
    if (tag && !expertise.includes(tag)) {
      setExpertise((prev) => [...prev, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setExpertise((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
      return
    }
    if (e.key === 'Backspace' && !tagInput && expertise.length > 0) {
      setExpertise((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = async () => {
    const validationErrors: string[] = []

    if (!title.trim()) validationErrors.push('Title is required.')
    if (!bio.trim()) validationErrors.push('Bio is required.')
    if (!pastExperiences.trim()) validationErrors.push('Past experiences are required.')
    if (bio.trim().length < 80) validationErrors.push('Bio should be at least 80 characters.')
    if (expertise.length === 0) validationErrors.push('Please add at least one skill.')
    if (!hasResolvedBootcamp) validationErrors.push('No bootcamp is available for this organization yet.')

    if (validationErrors.length > 0) {
      toast.error({
        title: 'Please complete the required fields',
        description: validationErrors.join(' '),
      })
      return
    }

    const resolvedBootcampId = bootcampId as number

    try {
      // Use POST only when there is no existing mentor profile (first-time)
      // Use PATCH for any subsequent updates to an existing profile
      const isFirstTime = !mentorProfile?.mentorProfileId

      const result = await updateMentorProfile({
        title: title.trim(),
        bio: bio.trim(),
        pastExperiences: pastExperiences.trim(),
        expertise,
        bootcampId: resolvedBootcampId,
      }, isFirstTime)
      await refetchMentorProfile()
      await onValidSubmit?.({
        title: title.trim(),
        bio: bio.trim(),
        pastExperiences: pastExperiences.trim(),
        expertise,
      })
      // Show API-provided status/message 
      const toastTitle = result.data?.status || 'Success'
      const toastDescription = result.message || result.data?.message
      toast.success({
        title: toastTitle,
        ...(toastDescription ? { description: toastDescription } : {}),
      })
      router.push(coursesHref)
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Something went wrong. Please try again.'

      toast.error({
        title: 'Save failed',
        description: message,
      })
    }
  }

  // Loading state
  if (loading || bootcampsLoading) {
    return (
      <MaxWidthWrapper>
        <div className="py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-body1 text-text-secondary">Loading your profile...</p>
          </div>
        </div>
      </MaxWidthWrapper>
    )
  }

  // API Error state
  if (apiError && !mentorProfile) {
    return (
      <MaxWidthWrapper>
        <div className="py-12">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-lg border border-destructive bg-destructive-light px-5 py-4">
              <p className="text-body2 font-semibold text-destructive">{apiError}</p>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    )
  }

  return (
    <MaxWidthWrapper>
      <div className="py-12">
        <div className="mx-auto max-w-3xl">
          {/* Top Actions */}
          <div className="mb-6 flex w-full items-center">
            <Link
              href={coursesHref}
              onClick={(e) => {
                if (!onBack) return
                e.preventDefault()
                onBack()
              }}
              className="inline-flex items-center shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back course
            </Link>
          </div>

          {/* Header */}
          <div className="mb-10 text-left">
            <h5 className="font-heading text-text-primary mb-3">Setup Your Profile</h5>
            <p className="text-body1 text-text-secondary">
              Share your expertise to help learners grow. Complete your mentor profile to unlock slots.
            </p>
          </div>

          {/* Profile Completeness Gate */}
          {completenessGate && !completenessGate.isComplete && (
            <div className="mb-8 rounded-lg border border-warning bg-warning-light px-5 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <h4 className="text-body2 font-semibold text-warning mb-2">
                    Profile Incomplete - Slot Creation Blocked
                  </h4>
                  <p className="text-body2 text-text-secondary mb-3">
                    Complete all required fields to publish availability slots and accept mentees.
                  </p>
                  <div className="space-y-2">
                    <div className="text-body2 font-medium text-text-secondary">
                      Completion: {completenessGate.completionPercentage}%
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-warning h-2 rounded-full transition-all"
                        style={{ width: `${completenessGate.completionPercentage}%` }}
                      />
                    </div>
                    {completenessGate.missingFields.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-caption font-semibold text-text-secondary">Missing fields:</p>
                        <ul className="text-caption space-y-1">
                          {completenessGate.missingFields.map((field) => (
                            <li key={field} className="text-text-secondary">
                              • {field === 'pastExperiences' ? 'Past Experiences' : field.charAt(0).toUpperCase() + field.slice(1)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Completion Success */}
          {completenessGate && completenessGate.isComplete && (
            <div className="mb-8 rounded-lg border border-success bg-success-light px-5 py-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-body2 font-semibold text-success text-left">
                    Profile Complete ✓
                  </h4>
                  <p className="text-body2 text-text-secondary mt-1">
                    Your profile is ready. You can now create and publish availability slots.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Sections */}
          <div className="space-y-7">
            {/* Title Section */}
            <div className="rounded-lg border border-border bg-card-light p-6 shadow-sm">
              <label className="block text-h6 font-heading text-text-primary mb-2 text-left">
                Title <span className="text-destructive">*</span>
              </label>
              <p className="text-body2 text-text-tertiary mb-4 text-left">
                Your public mentoring title shown to learners
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Mentor"
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-body1 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Bio Section */}
            <div className="rounded-lg border border-border bg-card-light p-6 shadow-sm">
              <label className="block text-h6 font-heading text-text-primary mb-2 text-left">
                Bio <span className="text-destructive">*</span>
              </label>
              <p className="text-body2 text-text-tertiary mb-4 text-left">
                A compelling summary about your background and expertise
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write 2–3 sentences about your background, expertise, and how you help learners grow..."
                rows={5}
                className="w-full resize-none rounded-md border border-input bg-background px-4 py-3 text-body1 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
              <div className={cn('mt-3 text-caption font-medium text-left', bio.trim().length >= 80 ? 'text-success' : 'text-text-tertiary')}>
                {bio.length} / 80+ characters {bio.trim().length >= 80 ? '✓' : ''}
              </div>
            </div>

            {/* Past Experiences Section */}
            <div className="rounded-lg border border-border bg-card-light p-6 shadow-sm">
              <label className="block text-h6 font-heading text-text-primary mb-2 text-left">
                Past Experiences <span className="text-destructive">*</span>
              </label>
              <p className="text-body2 text-text-tertiary mb-4 text-left">
                Share your professional journey, roles, and key achievements
              </p>
              <textarea
                value={pastExperiences}
                onChange={(e) => setPastExperiences(e.target.value)}
                placeholder="Describe your roles, responsibilities, and key accomplishments. Include companies, timeframes, and impact..."
                rows={5}
                className="w-full resize-none rounded-md border border-input bg-background px-4 py-3 text-body1 text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>

            {/* Skills Section */}
            <div className="rounded-lg border border-border bg-card-light p-6 shadow-sm">
              <label className="block text-h6 font-heading text-text-primary mb-2 text-left">
                Skills <span className="text-destructive">*</span>
              </label>
              <p className="text-body2 text-text-tertiary mb-5 text-left">
                What can you mentor others on?
              </p>

              {/* Tag Input */}
              <div
                onClick={() => tagRef.current?.focus()}
                className="flex min-h-[52px] flex-wrap items-center gap-2.5 rounded-md border-2 border-input bg-background px-4 py-3 cursor-text hover:border-primary/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
              >
                {expertise.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-caption font-semibold text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTag(tag)
                      }}
                      className="rounded-full hover:bg-primary/20 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
                <input
                  ref={tagRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    if (tagInput.trim()) addTag(tagInput)
                  }}
                  placeholder={expertise.length === 0 ? 'Type a skill and press Enter…' : 'Add more…'}
                  className="min-w-[140px] flex-1 bg-transparent text-body1 text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
              <p className="mt-2.5 text-caption text-text-tertiary text-left">Press Enter or comma to add a skill</p>

              {/* Suggested Skills */}
              <div className="mt-6 rounded-md border border-border bg-muted/30 p-5">
                <h3 className="mb-4 text-body2 font-semibold text-text-primary text-left">Suggested Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_EXPERTISE.map((skill) => {
                    const active = expertise.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => (active ? removeTag(skill) : addTag(skill))}
                        className={cn(
                          'rounded-md border px-3.5 py-2 text-caption font-medium transition-all',
                          active
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-card text-text-secondary hover:border-primary/50 hover:bg-primary-light/30'
                        )}
                      >
                        {active ? '✓ ' : ''}
                        {skill}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex items-center gap-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={updating || bootcampsLoading}
                className="flex-1 gap-2 bg-primary hover:bg-primary-dark text-primary-foreground h-11"
              >
                {(updating || bootcampsLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
                {updating
                  ? 'Saving your profile…'
                  : bootcampsLoading
                    ? 'Loading course…'
                    : 'Save & Continue'}
                {!updating && !bootcampsLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MaxWidthWrapper>
  )
}

export default function Page() {
  return <MentorProfileCreateUI />
}
