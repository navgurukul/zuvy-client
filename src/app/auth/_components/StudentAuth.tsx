'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import { Turnstile } from '@marsidev/react-turnstile'
import { api, setApiAuthToken } from '@/utils/axios.config'
import { AuthResponse } from '@/app/auth/login/_components/componentLogin'
import { getUser, useStudentData } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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
    setApiAuthToken(data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    localStorage.setItem('AUTH', JSON.stringify(user))
    localStorage.setItem('AUTH_PERMISSIONS', JSON.stringify(user.permissions || {}))
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
            try { persistStudentSession(authResponse); router.push('/student') } catch { router.push('/auth/login') }
        } else if (onLoginClick) onLoginClick()
        else router.push('/auth/login')
    }

    if (studentId) return <section className="w-full max-w-md rounded-lg border bg-card p-7 shadow-lg" aria-labelledby="student-id-title">
        <h1 id="student-id-title" className="mb-2 text-2xl font-bold">Your Student ID</h1>
        <p className="mb-5 text-sm text-muted-foreground">Save this ID somewhere safe. You will need it to log in. Student ID accounts do not have email-based password recovery; ask your teacher or the Zuvy team if you need help.</p>
        <div className="mb-5 rounded-lg border-2 border-primary bg-primary/5 p-6 text-center"><div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student ID</div><div className="mt-2 break-all text-3xl font-bold tracking-wide">{studentId}</div></div>
        <div className="mb-5 flex gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={() => { const blob = new Blob([`Zuvy Student ID\n\n${studentId}\n`], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `zuvy-student-id-${studentId}.txt`; anchor.click(); URL.revokeObjectURL(url) }}>Download</Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => { const printWindow = window.open('', '_blank', 'width=560,height=420'); if (!printWindow) return; printWindow.document.write(`<html><head><title>Zuvy Student ID</title><style>body{font-family:Arial,sans-serif;padding:48px;color:#111}.card{border:2px solid #333;border-radius:12px;padding:32px;text-align:center}.id{font-size:32px;font-weight:bold;margin-top:12px;word-break:break-all}</style></head><body><div class="card"><h1>Zuvy Student ID</h1><div class="id">${studentId.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char] || char))}</div></div></body></html>`); printWindow.document.close(); printWindow.focus(); printWindow.print(); printWindow.close() }}>Print</Button>
        </div>
        <label className="mb-5 flex cursor-pointer items-center gap-3 text-sm"><Checkbox checked={confirmed} onCheckedChange={(value) => setConfirmed(value === true)} />I have written down my Student ID</label>
        <Button className="w-full" disabled={!confirmed} onClick={continueAfterId}>Continue</Button>
    </section>

    return <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border bg-card p-7 shadow-lg">
        <div><h1 className="text-2xl font-bold">Create your student account</h1><p className="mt-1 text-sm text-muted-foreground">Sign up with a name and password to receive your Student ID.</p></div>
        <div className="space-y-2"><Label htmlFor="student-name">Full name</Label><Input id="student-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="student-password">Password</Label><Input id="student-password" type="password" autoComplete="new-password" required minLength={6} maxLength={64} value={password} onChange={e => setPassword(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="student-confirm-password">Confirm password</Label><Input id="student-confirm-password" type="password" autoComplete="new-password" required minLength={6} maxLength={64} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
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
            if (!data?.access_token || !data?.refresh_token || !data?.user) throw new Error('Invalid authentication response.')
            persistStudentSession(data)
            try { localStorage.setItem('last_student_id', id) } catch { /* storage may be disabled */ }
            router.push('/student')
        } catch (err: any) { setError(err.message === 'Invalid authentication response.' ? err.message : messageForError(err)) }
        finally { setLoading(false) }
    }
    return <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-lg border bg-card p-7 shadow-lg">
        <div><h2 className="text-xl font-bold">Login with Student ID</h2></div>
        <div className="space-y-2"><Label htmlFor="student-id-login">Student ID</Label><Input id="student-id-login" required autoComplete="username" value={studentId || rememberedId} onChange={e => { setStudentId(e.target.value); setRememberedId('') }} /></div>
        <div className="space-y-2"><Label htmlFor="student-login-password">Password</Label><Input id="student-login-password" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></div>
        <p className="text-sm text-muted-foreground">Forgot your password? Ask your teacher or the Zuvy team.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Login'}</Button>
        {onSignupClick && <p className="text-center text-sm text-muted-foreground">New student? <button type="button" className="text-primary underline" onClick={onSignupClick}>Create an account</button></p>}
    </form>
}
