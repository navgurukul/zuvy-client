'use client'
// Add global declaration for window.google to fix TypeScript error
declare global {
    interface Window {
        google: any
    }
}
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import {
    GoogleLogin,
    GoogleOAuthProvider,
    CredentialResponse,
} from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { api } from '@/utils/axios.config'
import { Button } from '@/components/ui/button'
import './styles/login.css'
import { toast } from '@/components/ui/use-toast'
import { getUser } from '@/store/store'
import Image from 'next/image'
import {DecodedGoogleToken,AuthResponse} from "@/app/auth/login/_components/componentLogin"
import { useThemeStore } from '@/store/store'



function LoginPage() {
    const { isDark, toggleTheme } = useThemeStore()
    const [loading, setLoading] = useState(false)
    const { user, setUser } = getUser()
    const router = useRouter()
    const googleLoginWrapperRef = useRef<HTMLDivElement>(null)

    // Social proof data
    const socialProofData = [
        {
            type: 'student',
            name: 'Vaishnavi Deokar',
            role: 'SDE Intern at Amazon',
            avatar: 'VS',
            image: '/vaishnavi.jpg',
        },
        {
            type: 'metric',
            number: '2000+',
            description: 'Learners across 18 states',
        },
        {
            type: 'student',
            name: 'Varun Guleria',
            role: 'Intern at Microsoft',
            avatar: 'VG',
            image: '/varu.jpg',
        },
        { type: 'metric', number: '400+', description: 'Internships secured' },
        {
            type: 'student',
            name: 'Astha Negi',
            role: 'Intern at Amazon',
            avatar: 'AN',
            image: '/ashi.jpg',
        },
        {
            type: 'metric',
            number: 'Over 70%',
            description: 'Learners are women',
        },
        {
            type: 'student',
            name: 'Ayushi Shah',
            role: 'SDC Intern at Amazon',
            avatar: 'AS',
            image: '/ayush.jpg',
        },
        {
            type: 'metric',
            number: '10 Months',
            description: 'Bootcamp duration',
        },
    ]

    const firstRowCards = socialProofData.slice(0, 5)
    const secondRowCards = socialProofData.slice(5, 8)

    // Student Card Component
    const StudentCard = ({
        name,
        role,
        avatar,
        image,
    }: {
        name: string
        role: string
        avatar: string
        image: string
    }) => (
        <div className="bg-primary-light p-3 rounded-lg flex items-center gap-3 min-w-fit flex-shrink-0">
            <div className="h-12 w-12 relative rounded-full overflow-hidden">
                <Image src={image} alt={name} fill className="object-cover" />
            </div>
            <div className="text-left">
                <div className="text-primary-dark font-bold text-md">
                    {name}
                </div>
                <div className="text-primary-dark text-sm">{role}</div>
            </div>
        </div>
    )

    // Metric Card Component
    const MetricCard = ({
        number,
        description,
    }: {
        number: string
        description: string
    }) => (
        <div className="bg-accent-light p-3 rounded-lg text-center min-w-fit flex-shrink-0">
            <div className="text-accent-dark font-bold text-md">{number}</div>
            <div className="text-accent-dark text-sm">{description}</div>
        </div>
    )

    // Handle successful Google Sign-In
const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        if (!credentialResponse.credential) {
            toast.error({
                title: 'Login Failed',
                description: 'No credential received from Google.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }

        setLoading(true)
        try {
            // Decode the Google JWT token to get user info
            const decoded: DecodedGoogleToken = jwtDecode(
                credentialResponse.credential
            )

            const googleData = {
                email: decoded.email,
                googleIdToken: credentialResponse.credential,
            }

            const response = await api.post<AuthResponse>(`/auth/login`, googleData)

            // Handle your backend response
            if (response.data.access_token) {
                localStorage.setItem('access_token', response.data.access_token)
                localStorage.setItem(
                    'refresh_token',
                    response.data.refresh_token
                )

                setUser(response.data.user)
                localStorage.setItem('AUTH', JSON.stringify(response.data.user))

                toast.success({
                    title: 'Login Successful',
                    description: 'Welcome to Zuvy Dashboard',
                })
                localStorage.setItem('isLoginFirst' , 'true')

                // Handle redirects based on user role
                const redirectedUrl = localStorage.getItem('redirectedUrl')

                const userRole = response.data.user.rolesList[0]
                const hasFilled = response.data.user.hasfilled

                setCookie('secure_typeuser', JSON.stringify(btoa(userRole)))

                if (redirectedUrl) {
                    router.push(redirectedUrl)
                } else if (userRole === 'student') {
                    router.push('/student')
                } else if ((userRole === 'admin' || userRole === 'poc') && hasFilled === false) {
                    // Redirect admin/poc to settings if hasfilled is false
                    router.push(`/${userRole}/setting`)
                } else {
                    // Default redirect for other roles or when hasfilled is true
                    router.push(`/${userRole}/courses`)
                }
            }
        } catch (err: any) {
            console.error('Google login error:', err)
            toast.error({
                title: 'Login Error',
                description: `${err.response?.data?.message}. Please contact zuvy support team` || 'Please try again later.',
                className: `fixed bottom-4 left-1/2 transform -translate-x-1/2 text-start capitalize border border-destructive max-w-lg box-border`,
            })
        } finally {
            setLoading(false)
        }
    }

    // Handle Google Sign-In failure
    const handleGoogleError = () => {
        console.error('Google login failed')
        toast.error({
            title: 'Login Failed',
            description: 'Google authentication failed. Please try again.',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
        })
    }

    useEffect(() => {
        // Handle existing token logic and redirects
        const urlParams = new URLSearchParams(window.location.search)
        let redirectedUrl = localStorage.getItem('redirectedUrl')

        if (window.location.href.includes('route')) {
            const route = urlParams.get('route')
            redirectedUrl = route ?? ''
            localStorage.setItem('redirectedUrl', redirectedUrl)
            setCookie('redirectedUrl', JSON.stringify(btoa(redirectedUrl)))
        }
    }, [router])

    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">
                        Configuration Error
                    </h2>
                    <p className="text-gray-600">
                        Google Client ID is not configured.
                    </p>
                </div>
            </div>
        )
    }

    const handleCustomGoogleLogin = () => {
        const googleLoginButton =
            googleLoginWrapperRef.current?.querySelector<HTMLDivElement>(
                'div[role="button"]'
            )
        if (googleLoginButton) {
            googleLoginButton.click()
        } else {
            toast.error({
                title: 'Login Error',
                description: 'Could not start Google login. Please try again.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
            {loading ? (
                <div className="loading-container">
                    <div className="loading"></div>
                    <div id="loading-text">Loading..</div>
                </div>
            ) : (
                <>
                    {/* Main Content Grid */}
                    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                        {/* Login Panel */}
                        <div className="w-full max-w-md md:p-12 p-6 text-center mb-20 md:mb-20 bg-card rounded-lg shadow-8dp border">
                            {/* Logo */}
                            <div className="mb-6">
                                {
                                    isDark ? (
                                        <Image
                                            src={'/zuvy-logo-horizontal-dark.png'}
                                            alt="Zuvy Logo"
                                            className="mx-auto"
                                            width={48}  
                                            height={48}
                                        />
                                    ) : (
                                    <Image
                                        src={'/zuvy-logo-horizontal.png'}
                                        alt="Zuvy Logo"
                                        className="mx-auto"
                                        width={48}
                                        height={48}
                                    />
                                    )
                                }
                            </div>

                            {/* Headline */}
                            <h1 className="text-3xl font-bold mb-4 leading-tight text-foreground">
                                Build Skills of Future
                                <br />
                                in Tech
                            </h1>

                            {/* Tagline */}
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Master in-demand programming skills and step
                                into a world of opportunities. Start learning
                                today!
                            </p>

                            {/* Hidden Google Login Component */}
                            <div className="hidden" ref={googleLoginWrapperRef}>
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    theme="outline"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="250"
                                    logo_alignment="left"
                                />
                            </div>

                            {/* Custom Google Login Button */}
                            <Button
                                type="button"
                                aria-label="Login with Google"
                                onClick={handleCustomGoogleLogin}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                size="lg"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Login with Google
                            </Button>
                        </div>

                        {/* Social Proof Section */}
                        <div className="w-full max-w-6xl">
                            {/* Desktop Layout */}
                            <div className="hidden md:block">
                                {/* Row 1 - 5 cards */}
                                <div className="flex justify-center gap-2 mb-2">
                                    {firstRowCards.map((card, index) => (
                                        <div key={index}>
                                            {card.type === 'student' ? (
                                                <StudentCard
                                                    name={card.name!}
                                                    role={card.role!}
                                                    avatar={card.avatar!}
                                                    image={card.image!}
                                                />
                                            ) : (
                                                <MetricCard
                                                    number={card.number!}
                                                    description={
                                                        card.description!
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Row 2 - 3 cards */}
                                <div className="flex justify-center gap-2">
                                    {secondRowCards.map((card, index) => (
                                        <div key={index}>
                                            {card.type === 'student' ? (
                                                <StudentCard
                                                    name={card.name!}
                                                    role={card.role!}
                                                    avatar={card.avatar!}
                                                    image={card.image!}
                                                />
                                            ) : (
                                                <MetricCard
                                                    number={card.number!}
                                                    description={
                                                        card.description!
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Layout - Horizontal Scroll */}
                            <div className="md:hidden relative">
                                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
                                    {socialProofData.map((card, index) => (
                                        <div
                                            key={index}
                                            className="flex-shrink-0"
                                        >
                                            {card.type === 'student' ? (
                                                <StudentCard
                                                    name={card.name!}
                                                    role={card.role!}
                                                    avatar={card.avatar!}
                                                    image={card.image!}
                                                />
                                            ) : (
                                                <MetricCard
                                                    number={card.number!}
                                                    description={
                                                        card.description!
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Right blur effect */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>

                                {/* Left blur hint when scrolled */}
                                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-primary/20 to-transparent pointer-events-none opacity-0 transition-opacity"></div>
                            </div>
                        </div>

                        {/* Background Decorative Elements */}
                        <div className="fixed inset-0 -z-10 pointer-events-none">
                            <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80">
                                <div
                                    style={{
                                        clipPath:
                                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                    }}
                                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/10 to-accent/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                                />
                            </div>
                            <div className="absolute inset-x-0 top-[calc(100%-13rem)] transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
                                <div
                                    style={{
                                        clipPath:
                                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                    }}
                                    className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-accent/10 to-primary/10 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </GoogleOAuthProvider>
    )
}

export default LoginPage