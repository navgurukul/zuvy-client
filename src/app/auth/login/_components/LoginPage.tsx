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
//         console.log('tokenVal', tokenVal)
//         console.log('token', tokenVal && reverseJwtBody(tokenVal))

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

//                 console.log('response', resp)

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

// // *********************************** With google login ***********************************
// 'use client'

// import React, { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { setCookie } from 'cookies-next'
// import {
//     GoogleLogin,
//     GoogleOAuthProvider,
//     CredentialResponse,
// } from '@react-oauth/google'
// import { jwtDecode } from 'jwt-decode'
// import { api, apiMeraki } from '@/utils/axios.config'
// import { Button } from '@/components/ui/button'
// import './styles/login.css'
// import { toast } from '@/components/ui/use-toast'
// import { getUser } from '@/store/store'

// type Props = {}

// interface DecodedGoogleToken {
//     iss: string
//     azp: string
//     aud: string
//     sub: string
//     email: string
//     email_verified: boolean
//     name: string
//     picture: string
//     given_name: string
//     family_name: string
//     iat: number
//     exp: number
// }

// function LoginPage({}: Props) {
//     const [loading, setLoading] = useState(false)
//     const { user, setUser } = getUser()
//     const router = useRouter()

//     // Handle successful Google Sign-In
//     const handleGoogleSuccess = async (
//         credentialResponse: CredentialResponse
//     ) => {
//         console.log('credentialResponse', credentialResponse)
//         if (!credentialResponse.credential) {
//             toast({
//                 title: 'Login Failed',
//                 description: 'No credential received from Google.',
//                 className:
//                     'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
//             })
//             return
//         }

//         setLoading(true)
//         try {
//             console.log('credentialResponse', credentialResponse)
//             // Decode the Google JWT token to get user info
//             const decoded: DecodedGoogleToken = jwtDecode(
//                 credentialResponse.credential
//             )

//             console.log(
//                 'credentialResponse.credential',
//                 credentialResponse.credential
//             )
//             const googleData = {
//                 email: decoded.email,
//                 googleIdToken: credentialResponse.credential,
//             }

//             console.log('googleData', googleData)
//             const response = await api.post(`/auth/login`, googleData)

//             console.log('response', response)

//             // Handle your backend response
//             if (response.data.access_token) {
//                 // localStorage.setItem('token', userToken)
//                 localStorage.setItem('access_token', response.data.access_token)
//                 // localStorage.setItem('token', response.data.access_token)

//                 console.log(
//                     'response.data.access_token',
//                     response.data.access_token
//                 )

//                 setUser(response.data.user)
//                 localStorage.setItem('AUTH', JSON.stringify(response.data.user))

//                 toast({
//                     title: 'Login Successful',
//                     description: 'Welcome to Zuvy Dashboard',
//                     className:
//                         'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
//                 })

//                 // Handle redirects based on user role
//                 const redirectedUrl = localStorage.getItem('redirectedUrl')

//                 if (!response.data.user.rolesList[0]) {
//                     setCookie(
//                         'secure_typeuser',
//                         JSON.stringify(btoa('student'))
//                     )
//                     router.push(redirectedUrl || '/student')
//                 } else {
//                     const userRole = response.data.user.rolesList[0]
//                     setCookie('secure_typeuser', JSON.stringify(btoa(userRole)))

//                     if (redirectedUrl) {
//                         router.push(redirectedUrl)
//                     } else if (userRole === 'admin') {
//                         router.push('/admin/courses')
//                     } else if (userRole === 'instructor') {
//                         router.push('/instructor')
//                     } else {
//                         router.push(`/${userRole}`)
//                     }
//                 }
//             }
//         } catch (err: any) {
//             console.error('Google login error:', err)
//             toast({
//                 title: 'Error while logging in Zuvy. Please try again!',
//                 description:
//                     err.response?.data?.message ||
//                     'An error occurred during login.',
//                 className:
//                     'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
//             })
//         } finally {
//             setLoading(false)
//         }
//     }

//     // Handle Google Sign-In failure
//     const handleGoogleError = () => {
//         console.error('Google login failed')
//         toast({
//             title: 'Login Failed',
//             description: 'Google authentication failed. Please try again.',
//             className:
//                 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
//         })
//     }

//     useEffect(() => {
//         // Handle existing token logic and redirects
//         const urlParams = new URLSearchParams(window.location.search)
//         let redirectedUrl = localStorage.getItem('redirectedUrl')

//         if (window.location.href.includes('route')) {
//             const route = urlParams.get('route')
//             redirectedUrl = route ?? ''
//             localStorage.setItem('redirectedUrl', redirectedUrl)
//             setCookie('redirectedUrl', JSON.stringify(btoa(redirectedUrl)))
//         }

//         // Initialize localStorage items
//         if (!localStorage.getItem('token')) {
//             localStorage.setItem('token', '')
//         }
//         if (!localStorage.getItem('loggedOut')) {
//             localStorage.setItem('loggedOut', String(false))
//         }
//     }, [router])

//     if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="text-center">
//                     <h2 className="text-2xl font-bold text-red-600 mb-4">
//                         Configuration Error
//                     </h2>
//                     <p className="text-gray-600">
//                         Google Client ID is not configured.
//                     </p>
//                 </div>
//             </div>
//         )
//     }

//     return (
//         <GoogleOAuthProvider
//             clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
//         >
//             {loading ? (
//                 <div className="loading-container">
//                     <div className="loading"></div>
//                     <div id="loading-text">Loading..</div>
//                 </div>
//             ) : (
//                 <>
//                     <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
//                         <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl">
//                             Embark your learning journey with
//                             <span className="text-[#2f433a]"> Zuvy </span>
//                             <span className="text-yellow-900">in Seconds.</span>
//                         </h1>
//                         <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
//                             The Future of Learning Begins with a Simple Sign-in.
//                             Start Your Journey Today!
//                         </p>

//                         {/* Google Sign-In Button */}
//                         <div className="mt-6 flex flex-col items-center space-y-4">
//                             <div className="flex flex-col items-center space-y-4">
//                                 {/* Primary Google Login Button */}
//                                 <GoogleLogin
//                                     onSuccess={handleGoogleSuccess}
//                                     onError={handleGoogleError}
//                                     size="large"
//                                     theme="outline"
//                                     text="continue_with"
//                                     shape="rectangular"
//                                     width="280"
//                                     logo_alignment="left"
//                                 />

//                                 {/* Alternative: Filled theme button */}
//                                 {/* <div className="text-sm text-gray-500">
//                                     or try different style
//                                 </div>

//                                 <GoogleLogin
//                                     onSuccess={handleGoogleSuccess}
//                                     onError={handleGoogleError}
//                                     size="large"
//                                     theme="filled_blue"
//                                     text="signin_with"
//                                     shape="rectangular"
//                                     width="280"
//                                     logo_alignment="left"
//                                 /> */}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Background decorative elements */}
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
//         </GoogleOAuthProvider>
//     )
// }

// export default LoginPage

// ************************************** Login Page ******************************************

// import { useState } from 'react'
// import Image from 'next/image'

// // Mock GoogleLogin component for demonstration
// const GoogleLogin = ({ onSuccess, onError, ...props }: any) => {
//     return (
//         <button
//             onClick={() => onSuccess({ credential: 'mock-token' })}
//             className="flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200 shadow-sm"
//             style={{ width: props.width || '280px' }}
//         >
//             <svg className="w-5 h-5" viewBox="0 0 24 24">
//                 <path
//                     fill="#4285F4"
//                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                 />
//                 <path
//                     fill="#34A853"
//                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                 />
//                 <path
//                     fill="#FBBC05"
//                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                 />
//                 <path
//                     fill="#EA4335"
//                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                 />
//             </svg>
//             <span>Continue with Google</span>
//         </button>
//     )
// }

// const ZuvyLandingPage = () => {
//     const [isLoading, setIsLoading] = useState(false)

//     const handleGoogleSuccess = (response: any) => {
//         setIsLoading(true)
//         console.log('Google login success:', response)
//         // Handle successful login here
//         setTimeout(() => setIsLoading(false), 1000)
//     }

//     const handleGoogleError = (error: any) => {
//         console.error('Google login error:', error)
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
//             {/* Background decorative elements */}
//             {/* <div className="absolute inset-0">
//                 <div className="isolate">
//                     <div
//                         aria-hidden="true"
//                         className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//                     >
//                         <div
//                             style={{
//                                 clipPath:
//                                     'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//                             }}
//                             className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[300deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-3rem)] sm:w-[72.1875rem]"
//                         />
//                     </div>
//                     <div
//                         aria-hidden="true"
//                         className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
//                     >
//                         <div
//                             style={{
//                                 clipPath:
//                                     'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
//                             }}
//                             className="relative left-[calc(50%-14rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
//                         />
//                     </div>
//                 </div>
//             </div> */}

//             <div className="relative z-10">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                     {/* Hero Section */}
//                     {/* <div className="mb-16 mt-16 sm:mt-24 flex flex-col items-center justify-center text-center">
//                         <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl leading-tight">
//                             Embark your learning journey with
//                             <span className="text-[#2f433a]"> Zuvy </span>
//                             <span className="text-yellow-900">in Seconds.</span>
//                         </h1>
//                         <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
//                             The Future of Learning Begins with a Simple Sign-in.
//                             Start Your Journey Today!
//                         </p>

//                         <div className="mt-8 flex flex-col items-center space-y-4">
//                             <GoogleLogin
//                                 onSuccess={handleGoogleSuccess}
//                                 onError={handleGoogleError}
//                                 size="large"
//                                 theme="outline"
//                                 text="continue_with"
//                                 shape="rectangular"
//                                 width="280"
//                                 logo_alignment="left"
//                             />
//                             {isLoading && (
//                                 <div className="text-sm text-gray-500">
//                                     Signing you in...
//                                 </div>
//                             )}
//                         </div>
//                     </div> */}

//                     {/* Main Content Grid */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
//                         {/* Masonry Grid Section */}
//                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max">
//                             {/* Profile Card - Vashnavi */}
//                             <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-transform duration-300">
//                                 <div className="w-16 h-16 bg-red-400 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold">
//                                     V
//                                 </div>
//                                 <h3 className="font-semibold text-sm">
//                                     Vashnavi Omkar
//                                 </h3>
//                                 <p className="text-xs opacity-90">
//                                     UX/UI Designer
//                                 </p>
//                             </div>

//                             {/* Stats Card - 5000+ */}
//                             <div className="bg-gradient-to-br from-teal-600 to-green-700 rounded-2xl p-6 text-white row-span-2 flex flex-col justify-center transform hover:scale-105 transition-transform duration-300">
//                                 <h2 className="text-4xl font-bold mb-2">
//                                     5000+
//                                 </h2>
//                                 <p className="text-sm opacity-90 leading-relaxed">
//                                     Learners across 50 Indian states
//                                 </p>
//                             </div>

//                             {/* Profile Card - Mantri */}
//                             <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-transform duration-300">
//                                 <div className="w-16 h-16 bg-blue-400 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold">
//                                     M
//                                 </div>
//                                 <h3 className="font-semibold text-sm">
//                                     Mantri Gaikwad
//                                 </h3>
//                                 <p className="text-xs opacity-90">
//                                     Full Stack Developer
//                                 </p>
//                             </div>

//                             {/* Highlight Card - 450+ */}
//                             <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white col-span-2 transform hover:scale-105 transition-transform duration-300">
//                                 <h2 className="text-5xl font-bold mb-2">
//                                     450+
//                                 </h2>
//                                 <p className="text-sm opacity-90">
//                                     Internships secured by our students
//                                 </p>
//                             </div>

//                             {/* Profile Card - Asha */}
//                             <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white text-center transform hover:scale-105 transition-transform duration-300">
//                                 <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-gray-800">
//                                     A
//                                 </div>
//                                 <h3 className="font-semibold text-sm">
//                                     Asha Negi
//                                 </h3>
//                                 <p className="text-xs opacity-90">
//                                     Data Scientist
//                                 </p>
//                             </div>

//                             {/* Stats Card - 75% */}
//                             <div className="bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
//                                 <h2 className="text-3xl font-bold mb-2">
//                                     Over 75%
//                                 </h2>
//                                 <p className="text-sm opacity-90">
//                                     Learners are currently all across India
//                                 </p>
//                             </div>

//                             {/* Testimonial Card with Image */}
//                             <div className="bg-gradient-to-br from-green-600 to-teal-700 rounded-2xl p-4 text-white row-span-2 flex flex-col justify-between transform hover:scale-105 transition-transform duration-300 relative">
//                                 <div className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm font-bold">
//                                     N
//                                 </div>
//                                 <div className="flex-1 mb-4">
//                                     <div className="w-full h-24 bg-gray-300 rounded-lg mb-3 flex items-center justify-center text-gray-600 text-xs">
//                                         Tech Workspace
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <h4 className="font-semibold text-sm">
//                                         Aman Shahi
//                                     </h4>
//                                     <p className="text-xs opacity-90">
//                                         Full Stack Developer
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Stats Card - 10 Months */}
//                             <div className="bg-gradient-to-br from-teal-600 to-green-700 rounded-2xl p-6 text-white transform hover:scale-105 transition-transform duration-300">
//                                 <h2 className="text-3xl font-bold mb-2">
//                                     10 Months
//                                 </h2>
//                                 <p className="text-sm opacity-90">
//                                     Bootcamp for 100% placement guarantee
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Right Side CTA Section */}
//                         <div className="bg-white rounded-3xl p-12 shadow-2xl text-center relative overflow-hidden">
//                             {/* Background decoration */}
//                             <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50"></div>

//                             <div className="relative z-10">
//                                 {/* Icon */}
//                                 <div className="w-20 h-20 bg-gradient-to-br from-[#2f433a] to-[#518672] rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl">
//                                     🏠
//                                 </div>

//                                 <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2f433a] to-[#518672] bg-clip-text text-transparent">
//                                     Build Skills of Future in Tech
//                                 </h1>

//                                 <p className="text-gray-600 text-lg mb-8 leading-relaxed">
//                                     Master in-demand programming skills and step
//                                     into a world of tech opportunities. Start
//                                     learning today!
//                                 </p>

//                                 <button className="bg-gradient-to-r from-[#2f433a] to-[#518672] text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto">
//                                     <svg
//                                         className="w-5 h-5"
//                                         viewBox="0 0 24 24"
//                                         fill="currentColor"
//                                     >
//                                         <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                                         <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                                         <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                                         <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//                                     </svg>
//                                     <span>Login with Google</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default ZuvyLandingPage

// ***************************** Login Page Grid ************************************
'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import {
    GoogleLogin,
    GoogleOAuthProvider,
    CredentialResponse,
} from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { api, apiMeraki } from '@/utils/axios.config'
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
            console.log('credentialResponse', credentialResponse)
            // Decode the Google JWT token to get user info
            const decoded: DecodedGoogleToken = jwtDecode(
                credentialResponse.credential
            )

            console.log(
                'credentialResponse.credential',
                credentialResponse.credential
            )
            const googleData = {
                email: decoded.email,
                googleIdToken: credentialResponse.credential,
            }

            console.log('googleData', googleData)
            const response = await api.post(`/auth/login`, googleData)

            console.log('response', response)

            // Handle your backend response
            if (response.data.access_token) {
                // localStorage.setItem('token', userToken)
                localStorage.setItem('access_token', response.data.access_token)
                localStorage.setItem('token', credentialResponse.credential)

                console.log(
                    'response.data.access_token',
                    response.data.access_token
                )

                setUser(response.data.user)
                localStorage.setItem('AUTH', JSON.stringify(response.data.user))

                toast({
                    title: 'Login Successful',
                    description: 'Welcome to Zuvy Dashboard',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
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
                        // router.push('/admin')
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
                    {/* <div className="grid grid-cols-12 gap-4 p-4">
                        <div className="col-span-7 bg-blue-100 p-4 rounded-xl shadow">
                            <h2 className="text-xl font-semibold mb-2">
                                Left Column (Wider)
                            </h2>
                            <p>This column takes up more space (7/12).</p>
                        </div>

                        <div className="col-span-5 bg-purple-100 p-4 rounded-xl shadow">
                            <h2 className="text-xl font-semibold mb-2">
                                Right Column
                            </h2>
                            <p>This column is slightly smaller (5/12).</p>
                        </div>
                    </div> */}

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
                                <div className="bg-[#518672] text-white rounded-xl p-4 text-center h-64 flex flex-col justify-center">
                                    <h2 className="text-xl font-bold">2000+</h2>
                                    <p>Learners across 18 Indian states</p>
                                </div>
                                <div className="relative rounded-xl overflow-hidden shadow-lg w-full h-64 mb-10">
                                    <Image
                                        src="/asha.jpg"
                                        alt="Astha Negi"
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
                                        // src="/ayush.jpg"
                                        src="/vaishnavi.jpg"
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
                                <h1 className="max-w-4xl text-2xl font-bold md:text-3xl lg:text-3xl">
                                    Build Skills of Future in Tech
                                </h1>
                                <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                                    Master in-demand programming skills and step
                                    into a <br /> world of tech opportunities.
                                    Start learning today!
                                </p>

                                <Button className="bg-[#518672] p-4 mt-3 h-30 w-70 w-[250px]">
                                    <span className="text-lg">
                                        Login with Google
                                    </span>
                                </Button>

                                <div className="mt-8 flex flex-col items-center space-y-4">
                                    <div className="hidden">
                                        <GoogleLogin
                                            //   ref={googleLoginRef}
                                            onSuccess={handleGoogleSuccess}
                                            onError={handleGoogleError}
                                            size="large"
                                            theme="outline"
                                            text="continue_with"
                                            shape="rectangular"
                                            width="280"
                                            logo_alignment="left"
                                        />
                                    </div>

                                    <Button
                                        className="bg-[#518672] hover:bg-[#2f433a] p-4 mt-3 h-auto w-[250px] text-white transition-colors duration-200"
                                        onClick={() => {
                                            // Trigger the hidden Google Login
                                            if (googleLoginRef.current) {
                                                googleLoginRef.current?.click()
                                            } else {
                                                // Fallback for demo
                                                handleGoogleSuccess({
                                                    credential: 'mock-token',
                                                })
                                            }
                                        }}
                                    >
                                        <span className="text-lg flex items-center space-x-3">
                                            <svg
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                            >
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            <span>Login with Google</span>
                                        </span>
                                    </Button>
                                </div>
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
                // <>
                //     <div className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
                //         <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-6xl">
                //             Embark your learning journey with
                //             <span className="text-[#2f433a]"> Zuvy </span>
                //             <span className="text-yellow-900">in Seconds.</span>
                //         </h1>
                //         <p className="mt-5 max-w-prose text-zinc-700 sm:text-lg">
                //             The Future of Learning Begins with a Simple Sign-in.
                //             Start Your Journey Today!
                //         </p>

                //         {/* Google Sign-In Button */}
                //         <div className="mt-6 flex flex-col items-center space-y-4">
                //             <div className="flex flex-col items-center space-y-4">
                //                 {/* Primary Google Login Button */}
                //                 <GoogleLogin
                //                     onSuccess={handleGoogleSuccess}
                //                     onError={handleGoogleError}
                //                     size="large"
                //                     theme="outline"
                //                     text="continue_with"
                //                     shape="rectangular"
                //                     width="280"
                //                     logo_alignment="left"
                //                 />

                //                 {/* Alternative: Filled theme button */}
                //                 {/* <div className="text-sm text-gray-500">
                //                     or try different style
                //                 </div>

                //                 <GoogleLogin
                //                     onSuccess={handleGoogleSuccess}
                //                     onError={handleGoogleError}
                //                     size="large"
                //                     theme="filled_blue"
                //                     text="signin_with"
                //                     shape="rectangular"
                //                     width="280"
                //                     logo_alignment="left"
                //                 /> */}
                //             </div>
                //         </div>
                //     </div>

                //     {/* Background decorative elements */}
                //     <div className="">
                //         <div className="top-70 isolate">
                //             <div
                //                 aria-hidden="true"
                //                 className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                //             >
                //                 <div
                //                     style={{
                //                         clipPath:
                //                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                //                     }}
                //                     className="relative left-[calc(50% -11rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[300deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-3rem)] sm:w-[72.1875rem]"
                //                 />
                //             </div>
                //             <div></div>
                //             <div
                //                 aria-hidden="true"
                //                 className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                //             >
                //                 <div
                //                     style={{
                //                         clipPath:
                //                             'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                //                     }}
                //                     className="relative left-[calc(50% -14rem)] aspect-[1155/678] w-[36.125rem]  -translate-x-1/2 rotate-[-30deg] bg-gradient-to-tr from-[#2f433a] to-[#518672] opacity-20 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
                //                 />
                //             </div>
                //         </div>
                //     </div>
                // </>
            )}
        </GoogleOAuthProvider>
    )
}

export default LoginPage
