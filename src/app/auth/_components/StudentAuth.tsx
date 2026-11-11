'use client'

import { ClipboardEvent, FormEvent, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { Turnstile } from '@marsidev/react-turnstile'
import { Check, Circle, Copy, Eye, EyeOff, ChevronsUpDown } from 'lucide-react'
import { api, setApiAuthToken } from '@/utils/axios.config'
import { AuthResponse } from '@/app/auth/login/_components/componentLogin'
import { getUser, useStudentData, useThemeStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { rememberAuthEntryRoute } from '@/utils/authEntryRoute'
import { isRedirectAllowed } from '@/utils/redirectValidation'
import { useSchoolCities, useSchoolStates, useSchools } from '@/hooks/useSchoolDirectory'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const passwordRules = [
    { id: 'min-length', label: 'At least 6 characters', test: (value: string) => value.length >= 6 },
    { id: 'number', label: 'At least one number (0–9)', test: (value: string) => /\d/.test(value) },
    { id: 'special', label: 'At least one special character (e.g. !@#$%^&*)', test: (value: string) => /[^A-Za-z0-9\s]/.test(value) },
    { id: 'lowercase', label: 'At least one lowercase letter (a–z)', test: (value: string) => /[a-z]/.test(value) },
] as const

function isPasswordValid(value: string) {
    return value.length <= 64 && passwordRules.every(rule => rule.test(value))
}

function getStudentPostLoginRoute() {
    const requestedRoute = new URLSearchParams(window.location.search).get('route')
    return isRedirectAllowed('student', requestedRoute) && requestedRoute.startsWith('/student/')
        ? requestedRoute
        : '/student'
}

function AuthLogo() {
    const { isDark } = useThemeStore()
    return <div className="mb-2 flex justify-center">
        <Image
            src={isDark ? '/zuvy-logo-horizontal-dark.png' : '/zuvy-logo-horizontal.png'}
            alt="Zuvy"
            width={58}
            height={48}
            priority
            className="h-[48px] w-[58px] object-contain"
        />
    </div>
}

type SignupResponse = Partial<AuthResponse> & {
    studentId?: string
    student_id?: string
    user?: (AuthResponse['user'] & { studentId?: string; student_id?: string })
}

function messageForError(error: any) {
    const status = error?.response?.status
    const message = error?.response?.data?.message
    if (status === 400) return message || 'Please check your details and complete the CAPTCHA again.'
    if (status === 429) return 'Too many attempts. Please wait a moment and try again.'
    if (status === 503) return 'Student accounts are temporarily unavailable. Please try again shortly.'
    return message || 'Something went wrong. Please try again.'
}

function persistStudentSession(data: AuthResponse) {
    const user = { ...data.user, email: data.user.email || '' }
    rememberAuthEntryRoute()
    setApiAuthToken(data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('AUTH', JSON.stringify(user))
    localStorage.setItem('AUTH_PERMISSIONS', JSON.stringify(user.permissions || {}))
    // Match the existing Google-login behavior so the /student guard keeps
    // Student ID users on the dashboard instead of redirecting to profile setup.
    localStorage.setItem('skipProfileSetup', 'true')
    localStorage.removeItem('isLoginFirst')
    const role = user.rolesList?.[0] || 'student'
    setCookie('secure_typeuser', JSON.stringify(btoa(String(role))))
    if (user.orgId) setCookie('orgId', String(user.orgId))
    getUser.getState().setUser(user)
    useStudentData.setState({ studentData: user as any })
}

export function StudentSignup({ onLoginClick, googleFooter }: { onLoginClick?: () => void; googleFooter?: ReactNode }) {
    const router = useRouter()
    const widget = useRef<any>(null)
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [captchaToken, setCaptchaToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [captchaError, setCaptchaError] = useState('')
    const [studentId, setStudentId] = useState('')
    const [confirmed, setConfirmed] = useState(false)
    const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null)
    const [copied, setCopied] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [state, setState] = useState('')
    const [city, setCity] = useState('')
    const [schoolSearch, setSchoolSearch] = useState('')
    const [schoolCode, setSchoolCode] = useState('')
    const [manualSchoolName, setManualSchoolName] = useState('')
    const [isManualSchool, setIsManualSchool] = useState(false)
    const [schoolOpen, setSchoolOpen] = useState(false)
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    const { data: states, loading: statesLoading, error: statesError } = useSchoolStates()
    const { data: cities, loading: citiesLoading, error: citiesError } = useSchoolCities(state)
    const {
        data: schools,
        loading: schoolsLoading,
        loadingMore: schoolsLoadingMore,
        hasMore: schoolsHasMore,
        error: schoolsError,
        loadMore: loadMoreSchools,
    } = useSchools({ state, city, search: schoolSearch })
    const selectedSchool = schools.find(school => school.udiseCode === schoolCode)
    const preventPasswordClipboard = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault()
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (loading || !captchaToken) return

        setError('')
        if (name.trim().length < 2 || name.trim().length > 100) return setError('Name must be between 2 and 100 characters.')
        if (!state || !city || (!schoolCode && (!isManualSchool || !manualSchoolName.trim()))) {
            return setError('Please select your state, city, and school.')
        }
        if (!isPasswordValid(password)) return setError('Please meet all password requirements listed below.')
        if (password !== confirmPassword) return setError('Passwords do not match.')
        setLoading(true)
        const token = captchaToken
        setCaptchaToken('')
        try {
            const { data } = await api.post<SignupResponse>('/auth/student/signup', {
                name: name.trim(),
                password,
                captchaToken: token,
                state,
                city,
                schoolName: isManualSchool ? manualSchoolName.trim() : undefined,
                udiseCode: isManualSchool ? null : schoolCode,
            })
            localStorage.setItem('CAREER_TOURS_BANNER_STORAGE_KEY', 'true')
            const id = data.studentId || data.student_id || data.user?.studentId || data.user?.student_id
            if (!id) throw new Error('The registration response did not include a Student ID.')
            setStudentId(String(id))
            if (data.access_token && data.refresh_token && data.user) setAuthResponse(data as AuthResponse)
        } catch (err: any) {
            setError(err.message?.includes('did not include') ? err.message : messageForError(err))
        } finally {
            setLoading(false)
            widget.current?.reset()
            setCaptchaToken('')
        }
    }

    const continueAfterId = () => {
        if (!confirmed) return
        if (authResponse) {
            try {
                persistStudentSession(authResponse)
                localStorage.setItem('skipProfileSetup', 'true')
                try { localStorage.setItem('student_id', studentId) } catch { /* storage may be disabled */ }
                router.push(getStudentPostLoginRoute())
            } catch { router.push('/student') }
        } else if (onLoginClick) onLoginClick()
        else router.push('/auth/login')
    }

    if (studentId) {
        return (
            <section
                className="w-full max-w-md rounded-lg border bg-card p-7 shadow-lg"
                aria-labelledby="student-id-title"
            >
                <AuthLogo />
                <h1 id="student-id-title" className="mb-2 text-2xl font-bold">
                    Your Student ID
                </h1>
                <p className="mb-5 text-sm text-muted-foreground">
                    Save this ID somewhere safe. You will need it to log in. Student ID accounts do not have
                    email-based password recovery; ask your teacher or the Zuvy team if you need help.
                </p>

                <div className="relative mb-5 rounded-lg border-2 border-primary bg-primary/5 p-6 pt-9 text-center">
                    <button
                        type="button"
                        aria-label={copied ? 'Student ID copied' : 'Copy Student ID'}
                        title="Copy Student ID"
                        onClick={() => {
                            navigator.clipboard.writeText(studentId).then(() => {
                                setCopied(true)
                                setTimeout(() => setCopied(false), 2000)
                            })
                        }}
                        className="absolute right-2 top-2 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        {copied ? (
                            <Check aria-hidden="true" className="h-4 w-4" />
                        ) : (
                            <Copy aria-hidden="true" className="h-4 w-4" />
                        )}
                        <span
                            aria-live="polite"
                            className={`absolute right-full top-1/2 mr-2 -translate-y-1/2 whitespace-nowrap text-xs transition-all duration-200 ease-out ${copied ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0'}`}
                        >
                            Copied
                        </span>
                    </button>
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Student ID
                    </div>
                    <div className="mt-2 break-all text-3xl font-bold tracking-wide">
                        {studentId}
                    </div>
                </div>

                <div className="mb-5 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            const blob = new Blob([`Zuvy Student ID\n\n${studentId}\n`], {
                                type: 'text/plain',
                            })
                            const url = URL.createObjectURL(blob)
                            const anchor = document.createElement('a')
                            anchor.href = url
                            anchor.download = `zuvy-student-id-${studentId}.txt`
                            anchor.click()
                            URL.revokeObjectURL(url)
                        }}
                    >
                        Download
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            const printWindow = window.open('', '_blank', 'width=560,height=420')
                            if (!printWindow) return

                            const escapedStudentId = studentId.replace(/[&<>"']/g, char => ({
                                '&': '&amp;',
                                '<': '&lt;',
                                '>': '&gt;',
                                '"': '&quot;',
                                "'": '&#39;',
                            })[char] || char)

                            printWindow.document.write(
                                `<html><head><title>Zuvy Student ID</title><style>body{font-family:Arial,sans-serif;padding:48px;color:#111}.card{border:2px solid #333;border-radius:12px;padding:32px;text-align:center}.id{font-size:32px;font-weight:bold;margin-top:12px;word-break:break-all}</style></head><body><div class="card"><h1>Zuvy Student ID</h1><div class="id">${escapedStudentId}</div></div></body></html>`
                            )
                            printWindow.document.close()
                            printWindow.focus()
                            printWindow.print()
                            printWindow.close()
                        }}
                    >
                        Print
                    </Button>
                </div>

                <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm">
                    <Checkbox
                        checked={confirmed}
                        onCheckedChange={value => setConfirmed(value === true)}
                    />
                    I have written down my Student ID
                </label>
                <Button className="w-full" disabled={!confirmed} onClick={continueAfterId}>
                    Continue
                </Button>
            </section>
        )
    }

    return (
        <form
            onSubmit={submit}
            className="w-full max-w-md space-y-4 rounded-lg border bg-card px-7 py-2 shadow-lg"
        >
            <AuthLogo />

            <div>
                <h1 className="text-2xl font-bold">Create your student account</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Sign up with a name and password to receive your Student ID.
                </p>
            </div>

            <div className="space-y-2 text-left">
                <Label htmlFor="student-name">Full name</Label>
                <Input
                    id="student-name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={name}
                    onChange={event => setName(event.target.value)}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 text-left">
                    <Label htmlFor="student-state">State</Label>
                    <Select
                        value={state}
                        onValueChange={value => {
                            setState(value)
                            setCity('')
                            setSchoolCode('')
                            setManualSchoolName('')
                            setIsManualSchool(false)
                            setSchoolSearch('')
                        }}
                    >
                        <SelectTrigger id="student-state" aria-label="State" disabled={statesLoading}>
                            <SelectValue placeholder={statesLoading ? 'Loading states…' : 'Select state'} />
                        </SelectTrigger>
                        <SelectContent>
                            {states.map(item => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {statesError && <p className="text-xs text-destructive">{statesError}</p>}
                </div>

                <div className="space-y-2 text-left">
                    <Label htmlFor="student-city">City</Label>
                    <Select
                        value={city}
                        onValueChange={value => {
                            setCity(value)
                            setSchoolCode('')
                            setManualSchoolName('')
                            setIsManualSchool(false)
                            setSchoolSearch('')
                        }}
                        disabled={!state || citiesLoading}
                    >
                        <SelectTrigger id="student-city" aria-label="City">
                            <SelectValue placeholder={citiesLoading ? 'Loading cities…' : 'Select city'} />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map(item => (
                                <SelectItem key={item} value={item}>{item}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {citiesError && <p className="text-xs text-destructive">{citiesError}</p>}
                </div>
            </div>

            <div className="space-y-2 text-left">
                <Label htmlFor="student-school-search">School</Label>
                {!isManualSchool && (
                    <Popover open={schoolOpen} onOpenChange={setSchoolOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="student-school-search"
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={schoolOpen}
                                aria-haspopup="listbox"
                                disabled={!state || !city}
                                className="w-full justify-between font-normal"
                            >
                                <span className="truncate">
                                    {selectedSchool?.schoolName || (city ? 'Search and select your school' : 'Select state and city first')}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                            <Command shouldFilter={false}>
                                <CommandInput
                                    autoFocus
                                    placeholder="Search schools..."
                                    value={schoolSearch}
                                    onValueChange={value => {
                                        setSchoolSearch(value)
                                        setSchoolCode('')
                                    }}
                                />
                                <CommandList
                                    onScroll={event => {
                                        const list = event.currentTarget
                                        const reachedBottom =
                                            list.scrollTop + list.clientHeight >= list.scrollHeight - 8

                                        if (reachedBottom && schoolsHasMore && !schoolsLoadingMore) {
                                            void loadMoreSchools()
                                        }
                                    }}
                                >
                                    {schoolsLoading && (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Searching schools…
                                        </p>
                                    )}
                                    {!schoolsLoading && schools.length === 0 && (
                                        <CommandEmpty>
                                            {schoolSearch ? 'No schools found.' : 'Start typing to search schools.'}
                                        </CommandEmpty>
                                    )}
                                    {!schoolsLoading && schools.map(school => (
                                        <CommandItem
                                            key={school.udiseCode}
                                            value={`${school.schoolName} ${school.udiseCode}`}
                                            onSelect={() => {
                                                setSchoolCode(school.udiseCode)
                                                setSchoolSearch(school.schoolName)
                                                setSchoolOpen(false)
                                            }}
                                        >
                                            <Check
                                                className={`mr-2 h-4 w-4 ${schoolCode === school.udiseCode ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                            <span className="truncate">{school.schoolName}</span>
                                        </CommandItem>
                                    ))}
                                    {schoolsLoadingMore && (
                                        <p className="py-3 text-center text-xs text-muted-foreground">
                                            Loading more schools…
                                        </p>
                                    )}
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
                {isManualSchool && (
                    <Input
                        id="student-school-search"
                        autoFocus
                        placeholder="Type your school name"
                        value={manualSchoolName}
                        onChange={event => setManualSchoolName(event.target.value)}
                        maxLength={200}
                        required
                    />
                )}
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox
                        checked={isManualSchool}
                        disabled={!state || !city}
                        onCheckedChange={checked => {
                            const useManualSchool = checked === true
                            setIsManualSchool(useManualSchool)
                            setSchoolCode('')
                            setSchoolSearch('')
                            setManualSchoolName('')
                            setSchoolOpen(false)
                        }}
                    />
                    <span>My school is not listed</span>
                </label>
                {schoolsError && <p className="text-xs text-destructive">{schoolsError}</p>}
            </div>

            <div className="space-y-2 text-left">
                <Label htmlFor="student-password">Password</Label>
                <div className="relative">
                    <Input
                        id="student-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        maxLength={64}
                        value={password}
                        onChange={event => {
                            setPassword(event.target.value)
                            setError('')
                        }}
                        onCopy={preventPasswordClipboard}
                        onCut={preventPasswordClipboard}
                        onPaste={preventPasswordClipboard}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(value => !value)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>

                <ul aria-label="Password requirements" className="space-y-1 text-xs">
                    {passwordRules.map(rule => {
                        const isMet = rule.test(password)

                        return (
                            <li
                                key={rule.id}
                                className={`flex items-center gap-2 ${isMet ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}
                            >
                                {isMet ? (
                                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                                ) : (
                                    <Circle aria-hidden="true" className="h-3 w-3" />
                                )}
                                {rule.label}
                            </li>
                        )
                    })}
                </ul>
            </div>

            <div className="space-y-0 text-left">
                <Label htmlFor="student-confirm-password">Confirm password</Label>
                <div className="relative">
                    <Input
                        id="student-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={6}
                        maxLength={64}
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                        onCopy={preventPasswordClipboard}
                        onCut={preventPasswordClipboard}
                        onPaste={preventPasswordClipboard}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        onClick={() => setShowConfirmPassword(value => !value)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    >
                        {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {siteKey ? (
                <Turnstile
                    ref={widget}
                    siteKey={siteKey}
                    onSuccess={token => {
                        setCaptchaToken(token)
                        setCaptchaError('')
                    }}
                    onExpire={() => {
                        setCaptchaToken('')
                        setCaptchaError('The verification expired. Please complete it again.')
                    }}
                    onError={code => {
                        setCaptchaToken('')
                        setCaptchaError(
                            `Cloudflare verification failed${code ? ` (${code})` : ''}. Check that challenges.cloudflare.com is reachable, then retry. If it continues, verify this site key and that this hostname is allowed in Cloudflare Turnstile.`
                        )
                    }}
                    onTimeout={() => {
                        setCaptchaToken('')
                        setCaptchaError('Cloudflare verification timed out. Please try again.')
                    }}
                />
            ) : (
                <p className="text-sm text-destructive">
                    Signup is unavailable: Turnstile site key is not configured.
                </p>
            )}

            {captchaError && (
                <div role="alert" className="space-y-0 text-left text-sm text-destructive">
                    <p>{captchaError}</p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setCaptchaToken('')
                            setCaptchaError('')
                            widget.current?.reset()
                        }}
                    >
                        Retry verification
                    </Button>
                </div>
            )}

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button
                className="w-full"
                type="submit"
                disabled={!captchaToken || loading || !siteKey}
            >
                {loading ? 'Creating account…' : 'Create Account'}
            </Button>

            <p className="mb-0 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                {onLoginClick ? (
                    <button
                        type="button"
                        className="text-primary underline"
                        onClick={onLoginClick}
                    >
                        Sign in
                    </button>
                ) : (
                    <Link className="text-primary underline" href="/auth/login">
                        Sign in
                    </Link>
                )}
            </p>

            {googleFooter}
        </form>
    )
}

export function StudentLogin({ onSignupClick, googleFooter }: { onSignupClick?: () => void; googleFooter?: ReactNode }) {
    const router = useRouter()
    const [studentId, setStudentId] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [rememberedId, setRememberedId] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    useEffect(() => {
        try { setRememberedId(localStorage.getItem('last_student_id') || '') } catch { /* storage may be disabled */ }
    }, [])
    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (loading) return
        setLoading(true); setError('')
        const id = (studentId || rememberedId).trim()
        try {
            const { data } = await api.post<AuthResponse>('/auth/student/login', { studentId: id, password })
            localStorage.setItem('isFirstTImeLogin', `${data.showTooltip}`)
            if (!data?.access_token || !data?.refresh_token || !data?.user) throw new Error('Invalid authentication response.')
            persistStudentSession(data)
            try { localStorage.setItem('last_student_id', id); localStorage.setItem('student_id', id) } catch { /* storage may be disabled */ }
            router.push(getStudentPostLoginRoute())
        } catch (err: any) { setError(err.message === 'Invalid authentication response.' ? err.message : messageForError(err)) }
        finally { setLoading(false) }
    }
    return (
        <form
            onSubmit={submit}
            className="w-full max-w-md space-y-4 rounded-lg border bg-card px-7 py-2 shadow-lg"
        >
            <AuthLogo />
            <div>
                <h2 className="text-xl font-bold">Login with Student ID</h2>
            </div>

            <div className="space-y-0 text-left">
                <Label htmlFor="student-id-login">Student ID</Label>
                <Input
                    id="student-id-login"
                    required
                    autoComplete="username"
                    value={studentId || rememberedId}
                    onChange={event => {
                        setStudentId(event.target.value)
                        setRememberedId('')
                    }}
                />
            </div>

            <div className="space-y-0 text-left">
                <Label htmlFor="student-login-password">Password</Label>
                <div className="relative">
                    <Input
                        id="student-login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        className="pr-10"
                    />
                    <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(value => !value)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Forgot your password? Ask your teacher or the Zuvy team.
            </p>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button className="w-full" type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Login'}
            </Button>

            {onSignupClick && (
                <p className="text-center text-sm text-muted-foreground">
                    New student?{' '}
                    <button
                        type="button"
                        className="text-primary underline"
                        onClick={onSignupClick}
                    >
                        Create an account
                    </button>
                </p>
            )}

            {googleFooter}
        </form>
    )
}
