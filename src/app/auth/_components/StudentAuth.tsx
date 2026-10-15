'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { Turnstile } from '@marsidev/react-turnstile'
import { Eye, EyeOff } from 'lucide-react'
import { api, setApiAuthToken } from '@/utils/axios.config'
import { AuthResponse } from '@/app/auth/login/_components/componentLogin'
import { getUser, useStudentData, useThemeStore } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { rememberAuthEntryRoute } from '@/utils/authEntryRoute'
import { isRedirectAllowed } from '@/utils/redirectValidation'

function getStudentPostLoginRoute() {
    const requestedRoute = new URLSearchParams(window.location.search).get('route')
    return isRedirectAllowed('student', requestedRoute) && requestedRoute.startsWith('/student/')
        ? requestedRoute
        : '/student'
}

function AuthLogo() {
    const { isDark } = useThemeStore()
    return <div className="mb-5 flex justify-center">
        <Image
            src={isDark ? '/zuvy-logo-horizontal-dark.png' : '/zuvy-logo-horizontal.png'}
            alt="Zuvy"
            width={52}
            height={44}
            priority
            className="h-[44px] w-[52px] object-contain"
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

export function StudentSignup({ onLoginClick }: { onLoginClick?: () => void }) {
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
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (loading || !captchaToken) return

        setError('')
        if (name.trim().length < 2 || name.trim().length > 100) return setError('Name must be between 2 and 100 characters.')
        if (password.length < 6 || password.length > 64) return setError('Password must be between 6 and 64 characters.')
        if (password !== confirmPassword) return setError('Passwords do not match.')
        setLoading(true)
        const token = captchaToken
        setCaptchaToken('')
        try {
            const { data } = await api.post<SignupResponse>('/auth/student/signup', { name: name.trim(), password, captchaToken: token })
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

    if (studentId) return <section className="w-full max-w-md rounded-lg border bg-card p-7 shadow-lg" aria-labelledby="student-id-title">
        <AuthLogo />
        <h1 id="student-id-title" className="mb-2 text-2xl font-bold">Your Student ID</h1>
        <p className="mb-5 text-sm text-muted-foreground">Save this ID somewhere safe. You will need it to log in. Student ID accounts do not have email-based password recovery; ask your teacher or the Zuvy team if you need help.</p>
        <div className="mb-5 rounded-lg border-2 border-primary bg-primary/5 p-6 text-center"><div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student ID</div><div className="mt-2 break-all text-3xl font-bold tracking-wide">{studentId}</div></div>
        <div className="mb-5 flex gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => { const blob = new Blob([`Zuvy Student ID\n\n${studentId}\n`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `zuvy-student-id-${studentId}.txt`; anchor.click(); URL.revokeObjectURL(url) }}>Download</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => { const printWindow = window.open('', '_blank', 'width=560,height=420'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Zuvy Student ID</title><style>body{font-family:Arial,sans-serif;padding:48px;color:#111}.card{border:2px solid #333;border-radius:12px;padding:32px;text-align:center}.id{font-size:32px;font-weight:bold;margin-top:12px;word-break:break-all}</style></head><body><div class="card"><h1>Zuvy Student ID</h1><div class="id">${studentId.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char] || char))}</div></div></body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close() }}>Print</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => { navigator.clipboard.writeText(studentId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }) }}>{copied ? 'Copied!' : 'Copy'}</Button>
        </div>
        <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm"><Checkbox checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} />I have written down my Student ID</label>
        <Button className="w-full" disabled={!confirmed} onClick={continueAfterId}>Continue</Button>
    </section>

    return <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border bg-card p-7 shadow-lg">
        <AuthLogo />
        <div><h1 className="text-2xl font-bold">Create your student account</h1><p className="mt-1 text-sm text-muted-foreground">Sign up with a name and password to receive your Student ID.</p></div>
        <div className="space-y-2"><Label htmlFor="student-name">Full name</Label><Input id="student-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="student-password">Password</Label><div className="relative"><Input id="student-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} maxLength={64} value={password} onChange={e => setPassword(e.target.value)} className="pr-10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <div className="space-y-2"><Label htmlFor="student-confirm-password">Confirm password</Label><div className="relative"><Input id="student-confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={6} maxLength={64} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pr-10" /><button type="button" aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirmPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        {siteKey ? <Turnstile ref={widget} siteKey={siteKey} onSuccess={(token) => { setCaptchaToken(token); setCaptchaError('') }} onExpire={() => { setCaptchaToken(''); setCaptchaError('The verification expired. Please complete it again.') }} onError={(code) => { setCaptchaToken(''); setCaptchaError(`Cloudflare verification failed${code ? ` (${code})` : ''}. Check that challenges.cloudflare.com is reachable, then retry. If it continues, verify this site key and that this hostname is allowed in Cloudflare Turnstile.`) }} onTimeout={() => { setCaptchaToken(''); setCaptchaError('Cloudflare verification timed out. Please try again.') }} /> : <p className="text-sm text-destructive">Signup is unavailable: Turnstile site key is not configured.</p>}
        {captchaError && <div role="alert" className="space-y-2 text-left text-sm text-destructive"><p>{captchaError}</p><Button type="button" variant="outline" size="sm" onClick={() => { setCaptchaToken(''); setCaptchaError(''); widget.current?.reset() }}>Retry verification</Button></div>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={!captchaToken || loading || !siteKey}>{loading ? 'Creating account…' : 'Create Account'}</Button>
        <p className="text-center text-sm text-muted-foreground">Already have an account? {onLoginClick ? <button type="button" className="text-primary underline" onClick={onLoginClick}>Sign in</button> : <Link className="text-primary underline" href="/auth/login">Sign in</Link>}</p>
    </form>
}

export function StudentLogin({ onSignupClick }: { onSignupClick?: () => void }) {
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
    return <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border bg-card p-7 shadow-lg">
        <AuthLogo />
        <div><h2 className="text-xl font-bold">Login with Student ID</h2></div>
        <div className="space-y-2"><Label htmlFor="student-id-login">Student ID</Label><Input id="student-id-login" required autoComplete="username" value={studentId || rememberedId} onChange={e => { setStudentId(e.target.value); setRememberedId('') }} /></div>
        <div className="space-y-2"><Label htmlFor="student-login-password">Password</Label><div className="relative"><Input id="student-login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(v => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus-visible:outline-none">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
        <p className="text-sm text-muted-foreground">Forgot your password? Ask your teacher or the Zuvy team.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
        {onSignupClick && <p className="text-center text-sm text-muted-foreground">New student? <button type="button" className="text-primary underline" onClick={onSignupClick}>Create an account</button></p>}
    </form>
}
