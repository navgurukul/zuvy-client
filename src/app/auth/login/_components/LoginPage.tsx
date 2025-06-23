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

type Props = {}

interface DecodedGoogleToken {
    iss: string
    azp: string
    aud: string
    sub: string
    email: string
    email_verified: boolean
    name: string
    picture: string
    given_name: string
    family_name: string
    iat: number
    exp: number
}

function LoginPage({}: Props) {
    const [loading, setLoading] = useState(false)
    const { user, setUser } = getUser()
    const router = useRouter()
    const googleLoginRef = useRef<HTMLElement>(null)

    // Handle successful Google Sign-In
    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        if (!credentialResponse.credential) {
            toast({
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

            const response = await api.post(`/auth/login`, googleData)

            // Handle your backend response
            if (response.data.access_token) {
                // localStorage.setItem('token', userToken)
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

                // Handle redirects based on user role
                const redirectedUrl = localStorage.getItem('redirectedUrl')

                if (!response.data.user.rolesList[0]) {
                    setCookie(
                        'secure_typeuser',
                        JSON.stringify(btoa('student'))
                    )
                    router.push(redirectedUrl || '/student')
                } else {
                    const userRole = response.data.user.rolesList[0]
                    setCookie('secure_typeuser', JSON.stringify(btoa(userRole)))

                    if (redirectedUrl) {
                        router.push(redirectedUrl)
                    } else if (userRole === 'admin') {
                        router.push('/admin/courses')
                    } else if (userRole === 'instructor') {
                        router.push('/instructor')
                    } else {
                        router.push(`/${userRole}`)
                    }
                }
            }
        } catch (err: any) {
            console.error('Google login error:', err)
            toast({
                title: 'Error while logging in Zuvy. Please try again!',
                description:
                    err.response?.data?.message ||
                    'An error occurred during login.',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        } finally {
            setLoading(false)
        }
    }

    // Handle Google Sign-In failure
    const handleGoogleError = () => {
        console.error('Google login failed')
        toast({
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

        // Initialize localStorage items
        if (!localStorage.getItem('token')) {
            localStorage.setItem('token', '')
        }
        if (!localStorage.getItem('loggedOut')) {
            localStorage.setItem('loggedOut', String(false))
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

    const googlePromptHandler = () => {
        window.google.accounts.id.prompt()
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-start h-screen">
                        <div className="bg-[#EEF3F1] grid grid-cols-1 md:grid-cols-3 gap-4 px-4 max-w-6xl mx-auto px-11">
                            {/* Left Column */}
                            <div className="flex flex-col justify-between gap-4">
                                <div className="relative rounded-b-xl overflow-hidden shadow-lg w-full h-64">
                                    <Image
                                        src="/vaishnavi.jpg"
                                        alt="Vaishnavi Deokar"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute text-start inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 py-3 flex flex-col justify-end">
                                        <p className="text-white font-bold text-md">
                                            Vaishnavi Deokar
                                        </p>
                                        <p className="text-white text-md">
                                            SDE Intern at Amazon
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#518672] text-white rounded-xl p-4 text-center h-72 flex flex-col justify-center">
                                    <h2 className="text-xl font-bold">2000+</h2>
                                    <p>Learners across 18 Indian states</p>
                                </div>
                                <div className="relative rounded-xl overflow-hidden shadow-lg w-full h-64 mb-10">
                                    <Image
                                        src="/ashi.jpg"
                                        alt="Ayushi Shah"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 py-3 flex flex-col justify-end">
                                        <p className="text-white font-semibold">
                                            Astha Negi
                                        </p>
                                        <p className="text-white text-sm">
                                            Intern at Amazon
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Center Column */}
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="relative rounded-xl overflow-hidden shadow-lg w-full h-64">
                                    <Image
                                        src="/varu.jpg"
                                        alt="Varun Guleria"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute text-start inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 py-3 flex flex-col justify-end">
                                        <p className="text-white font-bold text-md">
                                            Varun Guleria
                                        </p>
                                        <p className="text-white text-md">
                                            Intern at Microsoft
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#FFC374] rounded-xl p-4 text-center w-full h-64 flex flex-col justify-center">
                                    <h2 className="text-xl font-bold">
                                        Over 70%
                                    </h2>
                                    <p>Learners are women all across India</p>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col justify-between gap-4">
                                <div className="bg-[#FFC374] rounded-xl p-4 text-center h-64 flex flex-col justify-center mt-20">
                                    <h2 className="text-xl font-bold">400+</h2>
                                    <p>Internships secured by our scholars</p>
                                </div>
                                <div className="relative rounded-xl overflow-hidden shadow-lg w-full h-64">
                                    <Image
                                        src="/ayush.jpg"
                                        alt="Ayushi Shah"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute text-start inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-4 py-3 flex flex-col justify-end">
                                        <p className="text-white font-bold text-md">
                                            Ayushi Shah
                                        </p>
                                        <p className="text-white text-md">
                                            SDC Intern at Amazon
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-[#518672] text-white rounded-t-xl p-4 text-center h-64 flex flex-col justify-center">
                                    <h2 className="text-xl font-bold">
                                        10 Months
                                    </h2>
                                    <p>Bootcamp for 1000 scholars in 2025</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-12 text-center relative overflow-hidden h-screen">
                            <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
                                <Image
                                    src={'/logo.PNG'}
                                    alt="logo"
                                    className="p-2"
                                    width={'120'}
                                    height={'120'}
                                />
                                <h1 className="max-w-4xl text-2xl font-bold md:text-3xl lg:text-3xl">
                                    Build Skills of Future in Tech
                                </h1>
                                <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                                    Master in-demand programming skills and step
                                    into a <br /> world of tech opportunities.
                                    Start learning today!
                                </p>

                                <div className="hidden">
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

                                <Button
                                    type="button"
                                    aria-label="Login with Google"
                                    onClick={googlePromptHandler}
                                    className="bg-[#518672] hover:bg-[#2f433a] p-4 mt-3 h-auto w-[250px] text-white transition-colors duration-200"
                                >
                                    <span className="text-lg flex items-center space-x-3">
                                        <span className="bg-white rounded-full p-1">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5"
                                                viewBox="0 0 48 48"
                                            >
                                                <path
                                                    fill="#EA4335"
                                                    d="M24 9.5c3.54 0 5.91 1.53 7.26 2.82l5.34-5.19C33.21 3.69 28.94 2 24 2 14.88 2 7.44 7.95 4.69 15.47l6.42 4.99C12.57 14.65 17.78 9.5 24 9.5z"
                                                />
                                                <path
                                                    fill="#4285F4"
                                                    d="M46.17 24.5c0-1.57-.13-3.13-.4-4.61H24v8.75h12.45c-.54 2.88-2.17 5.31-4.64 6.99l7.27 5.66c4.23-3.91 6.64-9.69 6.64-16.79z"
                                                />
                                                <path
                                                    fill="#FBBC05"
                                                    d="M10.97 28.64a13.98 13.98 0 0 1 0-9.28l-6.42-4.99A23.98 23.98 0 0 0 2 24c0 3.86.93 7.51 2.55 10.76l6.42-5.12z"
                                                />
                                                <path
                                                    fill="#34A853"
                                                    d="M24 46c6.48 0 11.92-2.13 15.89-5.77l-7.27-5.66c-2 1.35-4.6 2.14-8.62 2.14-6.22 0-11.43-5.15-12.91-11.61l-6.42 5.12C7.44 40.05 14.88 46 24 46z"
                                                />
                                                <path
                                                    fill="none"
                                                    d="M2 2h44v44H2z"
                                                />
                                            </svg>
                                        </span>
                                        <span>Login with Google</span>
                                    </span>
                                </Button>
                            </div>
                            <div className="">
                                <div className="top-70 isolate">
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                                    >
                                        <div
                                            style={{
                                                clipPath:
                                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                            }}
                                            className="relative left-[calc(50% -11rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[300deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-3rem)] sm:w-[72.1875rem]"
                                        />
                                    </div>
                                    <div></div>
                                    <div
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                                    >
                                        <div
                                            style={{
                                                clipPath:
                                                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                            }}
                                            className="relative left-[calc(50% -14rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </GoogleOAuthProvider>
    )
}

export default LoginPage
