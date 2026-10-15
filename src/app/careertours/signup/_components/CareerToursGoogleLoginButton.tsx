'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { setCookie, deleteCookie } from 'cookies-next'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { useLogin } from '@/hooks/useLogin'
import { DecodedGoogleToken, AuthResponse } from '@/app/auth/login/_components/componentLogin'
import { MentorProfileResponse } from '@/app/[admin]/hooks/hookType'
import { getMentorProfileApi } from '@/app/[admin]/hooks/useGetMentorProfile'
import { getUser, useStudentData } from '@/store/store'
import { setApiAuthToken } from '@/utils/axios.config'
import { isRedirectAllowed } from '@/utils/redirectValidation'
import { rememberAuthEntryRoute } from '@/utils/authEntryRoute'

function isMentorProfileComplete(profile: MentorProfileResponse | null) {
    if (!profile) return false
    const bio = typeof profile.bio === 'string' ? profile.bio.trim() : ''
    const pastExperiences = typeof profile.pastExperiences === 'string' ? profile.pastExperiences.trim() : ''
    const expertiseValue = profile.expertise as string[] | string | null | undefined
    const expertise = Array.isArray(expertiseValue)
        ? expertiseValue
        : typeof expertiseValue === 'string'
            ? expertiseValue.split(',').map((item) => item.trim()).filter(Boolean)
            : []
    return Boolean(bio) && Boolean(pastExperiences) && expertise.length > 0
}

async function getMentorProfileCompletion(): Promise<boolean | null> {
    try {
        const response = await getMentorProfileApi()
        return isMentorProfileComplete(response.data)
    } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 404) return false
        console.error('Failed to fetch mentor profile for redirect:', error)
        return null
    }
}

export function CareerToursGoogleLoginButton() {
    const router = useRouter()
    const { login } = useLogin()
    const [loading, setLoading] = useState(false)
    const googleLoginWrapperRef = useRef<HTMLDivElement>(null)
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error({ title: 'Login Failed', description: 'No credential received from Google.' })
            return
        }

        setLoading(true)
        try {
            const decoded: DecodedGoogleToken = jwtDecode(credentialResponse.credential)
            const response = await login({
                email: decoded.email,
                googleIdToken: credentialResponse.credential,
            })
            const data: AuthResponse = response.data

            if (!data.access_token) throw new Error('No access token received.')

            rememberAuthEntryRoute()
            setApiAuthToken(data.access_token)
            localStorage.setItem('refresh_token', data.refresh_token)
            getUser.getState().setUser(data.user)
            useStudentData.setState({ studentData: data.user as any })
            localStorage.setItem('AUTH', JSON.stringify(data.user))
            localStorage.setItem('AUTH_PERMISSIONS', JSON.stringify(data.user.permissions || {}))

            if (data.showTooltip) {
                localStorage.setItem('isLoginFirst', 'true')
                localStorage.removeItem('skipProfileSetup')
            } else {
                localStorage.removeItem('isLoginFirst')
                localStorage.setItem('skipProfileSetup', 'true')
            }

            const normalizedRoles = Array.isArray(data.user.rolesList)
                ? data.user.rolesList.map((role) => String(role).toLowerCase())
                : []
            const userRole = normalizedRoles[0] || ''
            const organizationId = data.user.orgId || null
            const shouldCheckMentorProfile = normalizedRoles.includes('instructor')
            const mentorProfileCompleted = shouldCheckMentorProfile
                ? await getMentorProfileCompletion()
                : null

            setCookie('secure_typeuser', JSON.stringify(btoa(userRole)))
            if (organizationId) setCookie('orgId', String(organizationId))

            const requestedRoute =
                localStorage.getItem('redirectedUrl') ||
                new URLSearchParams(window.location.search).get('route')
            localStorage.removeItem('redirectedUrl')
            deleteCookie('redirectedUrl', { path: '/' })
            deleteCookie('redirectedUrl')
            document.cookie = 'redirectedUrl=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

            toast.success({ title: 'Login Successful', description: 'Welcome to Zuvy Dashboard' })

            if (shouldCheckMentorProfile && mentorProfileCompleted !== true && organizationId) {
                router.push(`/${userRole}/organizations/${organizationId}/profile`)
            } else if (isRedirectAllowed(userRole, requestedRoute)) {
                router.push(requestedRoute)
            } else if (userRole === 'super_admin') {
                router.push(`/${userRole}/organizations?page=1&limit=10`)
            } else if (organizationId) {
                router.push(`/${userRole}/organizations/${organizationId}/courses`)
            } else {
                router.push(`/${userRole}`)
            }
        } catch (error: any) {
            console.error('CareerTours Google login error:', error)
            toast.error({
                title: 'Login Error',
                description: error?.response?.data?.message || 'Please try again or contact Zuvy support.',
            })
        } finally {
            setLoading(false)
        }
    }

    const startGoogleLogin = () => {
        const googleButton = googleLoginWrapperRef.current?.querySelector<HTMLDivElement>('div[role="button"]')
        if (googleButton) {
            googleButton.click()
        } else {
            toast.error({ title: 'Login Error', description: 'Could not start Google login. Please try again.' })
        }
    }

    if (!clientId) return null

    return <GoogleOAuthProvider clientId={clientId}>
        <div className="hidden" ref={googleLoginWrapperRef}>
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error({ title: 'Login Failed', description: 'Google authentication failed. Please try again.' })} size="large" theme="outline" text="continue_with" shape="rectangular" width="250" logo_alignment="left" />
        </div>
        <Button type="button" onClick={startGoogleLogin} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" aria-label="Login with Google">
            {loading ? 'Signing in…' : <><svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 2.09 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Login with Google</>}
        </Button>
    </GoogleOAuthProvider>
}
