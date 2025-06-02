// 'use client'
// import React, { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { setCookie } from 'cookies-next'
// import axios from 'axios'

// import { Button } from '@/components/ui/button'

// import './styles/login.css'
// import { toast } from '@/components/ui/use-toast'
// import Link from 'next/link'
// import { apiMeraki } from '@/utils/axios.config'
// import { getUser } from '@/store/store'

// type Props = {}

// function LoginPage({}: Props) {
//     function reverseJwtBody(jwt: string): string {
//         const [header, body, signature] = jwt.split('.')
//         const reversedBody = body.split('').reverse().join('')

//         return [header, reversedBody, signature].join('.')
//     }
//     // const [loginUrl, setLoginUrl] = useState("");

//     const loginUrl = process.env.NEXT_PUBLIC_ZUVY_LOGIN_URL

//     const [loading, setLoading] = useState(true)
//     const { user, setUser } = getUser()
//     const router = useRouter()

//     useEffect(() => {
//         const urlParams = new URLSearchParams(window.location.search)
//         const tokenVal = urlParams.get('token')
//         const loggedOutToken = urlParams.get('loggedOutToken')

//         let redirectedUrl = localStorage.getItem('redirectedUrl')
//         if (window.location.href.includes('route')) {
//             const route = urlParams.get('route')
//             redirectedUrl = route ?? ''
//             localStorage.setItem('redirectedUrl', redirectedUrl)
//             setCookie('redirectedUrl', JSON.stringify(btoa(redirectedUrl)))
//         }

//         const sendGoogleUserData = async (token: any) => {
//             try {
//                 const resp = await apiMeraki.get(`/users/me`, {
//                     headers: {
//                         accept: 'application/json',
//                         Authorization: token,
//                     },
//                 })

//                 setUser(resp.data.user)

//                 if (resp.data.user) {
//                     toast({
//                         title: 'Login Successful',
//                         description: 'Welcome to Zuvy Dashboard',
//                         className:
//                             'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
//                     })
//                 }

//                 // dispatch(saveStudent(resp.data.user));
//                 localStorage.setItem('AUTH', JSON.stringify(resp.data.user))
//                 if (!resp.data.user.rolesList[0]) {
//                     setCookie(
//                         'secure_typeuser',
//                         JSON.stringify(btoa('student'))
//                     )

//                     if (redirectedUrl) {
//                         return router.push(redirectedUrl)
//                     } else {
//                         return router.push('student')
//                     }
//                 } else if (resp.data.user.rolesList[0]) {
//                     const userRole = resp.data.user.rolesList[0]
//                     setCookie(
//                         'secure_typeuser',
//                         JSON.stringify(btoa(resp.data.user.rolesList[0]))
//                     )
//                     if (redirectedUrl) {
//                         return router.push(redirectedUrl)
//                     } else if (userRole === 'admin') {
//                         return router.push('/admin/courses')
//                     } else if (userRole === 'instructor') {
//                         return router.push('/instructor')
//                     }

//                     return router.push(`/${resp.data.user.rolesList[0]}`)
//                 }
//             } catch (err: any) {
//                 toast({
//                     title: 'Failed',
//                     description:
//                         err.response?.data?.message || 'An error occurred.',
//                     className:
//                         'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
//                 })
//             }
//         }

//         if (tokenVal) {
//             setLoading(true)
//             localStorage.setItem(
//                 'loggedOutToken',
//                 JSON.stringify(loggedOutToken)
//             )
//             localStorage.setItem('token', reverseJwtBody(tokenVal))
//             sendGoogleUserData(reverseJwtBody(tokenVal))
//         } else {
//             setLoading(false)
//         }

//         if (!localStorage.getItem('token')) {
//             localStorage.setItem('token', '')
//             // setCookie('redirectedUrl', JSON.stringify(btoa('')))
//         }
//         if (!localStorage.getItem('loggedOut')) {
//             localStorage.setItem('loggedOut', String(false))
//         }
//     }, [router])

//     return (
//         <>
//             {loading ? (
//                 <div className="loading-container">
//                     <div className="loading"></div>
//                     <div id="loading-text">Loading..</div>
//                 </div>
//             ) : (
//                 <>
//                     <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
//                         {/* <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-600 bg-white px-7 py-2 shadow-md backdrop-blur hover:border-gray-600 hover:bg-white/50">
//                             <p className="text-sm font-semibold text-gray-700">
//                                 Zuvy is under construction
//                             </p>
//                         </div> */}
//                         <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl">
//                             Embark your learning journey with
//                             <span className="text-[#2f433a]"> Zuvy </span>
//                             <span className="text-yellow-900">in Seconds.</span>
//                         </h1>
//                         <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
//                             The Future of Learning Begins with a Simple Sign-in.
//                             Start Your Journey Today!
//                         </p>
//                         <Link href={loginUrl || 'defaultUrl'}>
//                             <Button className="bg-[#2f433a] p-4 mt-3 h-30 w-70 w-[250px]">
//                                 <span className="text-lg">Login to Zuvy</span>
//                             </Button>
//                         </Link>
//                     </div>
//                     <div className="">
//                         <div className="top-70 isolate">
//                             <div
//                                 aria-hidden="true"
//                                 className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//                             >
//                                 <div
//                                     style={{
//                                         clipPath:
//                                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//                                     }}
//                                     className="relative left-[calc(50% -11rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[300deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-3rem)] sm:w-[72.1875rem]"
//                                 />
//                             </div>
//                             <div></div>
//                             <div
//                                 aria-hidden="true"
//                                 className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//                             >
//                                 <div
//                                     style={{
//                                         clipPath:
//                                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//                                     }}
//                                     className="relative left-[calc(50% -14rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </>
//     )
// }

// export default LoginPage

'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import {
    GoogleLogin,
    GoogleOAuthProvider,
    CredentialResponse,
} from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

import { Button } from '@/components/ui/button'
import './styles/login.css'
import { toast } from '@/components/ui/use-toast'
import { apiMeraki } from '@/utils/axios.config'
import { getUser } from '@/store/store'

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

    // Your existing JWT reverse function (keep if needed for your backend)
    function reverseJwtBody(jwt: string): string {
        const [header, body, signature] = jwt.split('.')
        const reversedBody = body.split('').reverse().join('')
        return [header, reversedBody, signature].join('.')
    }

    // Handle successful Google Sign-In
    const handleGoogleSuccess = async (
        credentialResponse: CredentialResponse
    ) => {
        console.log('credentialResponse', credentialResponse)
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
                id: decoded.sub,
                name: decoded.name,
                imageUrl: decoded.picture,
                email: decoded.email,
                idToken: credentialResponse.credential,
                given_name: decoded.given_name,
                family_name: decoded.family_name,
            }

            // Send the Google data to your backend
            const resp = await apiMeraki.post(
                '/auth/google-signin',
                googleData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )

            // Handle your backend response
            if (resp.data.token) {
                const userToken = resp.data.token
                localStorage.setItem('token', userToken)

                // Get user data
                const userResp = await apiMeraki.get(`/users/me`, {
                    headers: {
                        accept: 'application/json',
                        Authorization: userToken,
                    },
                })

                setUser(userResp.data.user)
                localStorage.setItem('AUTH', JSON.stringify(userResp.data.user))

                toast({
                    title: 'Login Successful',
                    description: 'Welcome to Zuvy Dashboard',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })

                // Handle redirects based on user role
                const redirectedUrl = localStorage.getItem('redirectedUrl')

                if (!userResp.data.user.rolesList[0]) {
                    setCookie(
                        'secure_typeuser',
                        JSON.stringify(btoa('student'))
                    )
                    router.push(redirectedUrl || '/student')
                } else {
                    const userRole = userResp.data.user.rolesList[0]
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
                title: 'Login Failed',
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
                    <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
                        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl">
                            Embark your learning journey with
                            <span className="text-[#2f433a]"> Zuvy </span>
                            <span className="text-yellow-900">in Seconds.</span>
                        </h1>
                        <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                            The Future of Learning Begins with a Simple Sign-in.
                            Start Your Journey Today!
                        </p>

                        {/* Google Sign-In Button */}
                        <div className="mt-6 flex flex-col items-center space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                {/* Primary Google Login Button */}
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    theme="outline"
                                    text="continue_with"
                                    shape="rectangular"
                                    width="280"
                                    logo_alignment="left"
                                />

                                {/* Alternative: Filled theme button */}
                                <div className="text-sm text-gray-500">
                                    or try different style
                                </div>

                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    size="large"
                                    theme="filled_blue"
                                    text="signin_with"
                                    shape="rectangular"
                                    width="280"
                                    logo_alignment="left"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Background decorative elements */}
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
                </>
            )}
        </GoogleOAuthProvider>
    )
}

export default LoginPage
