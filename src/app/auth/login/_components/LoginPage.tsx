'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'
import axios from 'axios'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

import './styles/login.css'
import { toast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { apiMeraki } from '@/utils/axios.config'
import { getUser } from '@/store/store'

type Props = {}

function LoginPage({}: Props) {
    function reverseJwtBody(jwt: string): string {
        const [header, body, signature] = jwt.split('.')
        const reversedBody = body.split('').reverse().join('')

        return [header, reversedBody, signature].join('.')
    }

    const loginUrl = process.env.NEXT_PUBLIC_ZUVY_LOGIN_URL
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [magicLinkSent, setMagicLinkSent] = useState(false)
    const [redirectedUrl, setRedirectedUrl] = useState<string | null>(null)
    const { user, setUser } = getUser()
    const router = useRouter()

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const tokenVal = urlParams.get('token')
        const loggedOutToken = urlParams.get('loggedOutToken')

        let redirectUrl = localStorage.getItem('redirectedUrl')
        setRedirectedUrl(redirectUrl)
        
        if (window.location.href.includes('route')) {
            const route = urlParams.get('route')
            redirectUrl = route ?? ''
            localStorage.setItem('redirectedUrl', redirectUrl)
            setCookie('redirectedUrl', JSON.stringify(btoa(redirectUrl)))
            setRedirectedUrl(redirectUrl)
        }

        if (tokenVal) {
            setLoading(true)
            localStorage.setItem('loggedOutToken', JSON.stringify(loggedOutToken))
            localStorage.setItem('token', reverseJwtBody(tokenVal))
            sendGoogleUserData(reverseJwtBody(tokenVal))
        }

        if (!localStorage.getItem('token')) {
            localStorage.setItem('token', '')
        }
        if (!localStorage.getItem('loggedOut')) {
            localStorage.setItem('loggedOut', String(false))
        }
    }, [router])

    const sendGoogleUserData = async (token: any) => {
        try {
            const resp = await apiMeraki.get(`/users/me`, {
                headers: {
                    accept: 'application/json',
                    Authorization: token,
                },
            })

            setUser(resp.data.user)

            if (resp.data.user) {
                toast({
                    title: 'Login Successful',
                    description: 'Welcome to Zuvy Dashboard',
                    className: 'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
            }

            localStorage.setItem('AUTH', JSON.stringify(resp.data.user))
            if (!resp.data.user.rolesList[0]) {
                setCookie('secure_typeuser', JSON.stringify(btoa('student')))

                if (redirectedUrl) {
                    return router.push(redirectedUrl)
                } else {
                    return router.push('student')
                }
            } else if (resp.data.user.rolesList[0]) {
                const userRole = resp.data.user.rolesList[0]
                setCookie('secure_typeuser', JSON.stringify(btoa(resp.data.user.rolesList[0])))
                if (redirectedUrl) {
                    return router.push(redirectedUrl)
                } else if (userRole === 'admin') {
                    return router.push('/admin/courses')
                } else if (userRole === 'instructor') {
                    return router.push('/instructor')
                }

                return router.push(`/${resp.data.user.rolesList[0]}`)
            }
        } catch (err: any) {
            setLoading(false)
            toast({
                title: 'Failed',
                description: err.response?.data?.message || 'An error occurred.',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    const handleGoogleSignIn = () => {
        window.location.href = loginUrl || ''
    }

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !email.includes('@')) {
            toast({
                title: 'Invalid Email',
                description: 'Please enter a valid email address',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
            return
        }
        
        setLoading(true)
        
        try {
            await apiMeraki.post('/auth/magic-link', { email })
            
            setMagicLinkSent(true)
            toast({
                title: 'Magic Link Sent',
                description: 'Check your email for the login link',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (err: any) {
            toast({
                title: 'Failed',
                description: err.response?.data?.message || 'Failed to send magic link.',
                className: 'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading ? (
                <div className="loading-container">
                    <div className="loading"></div>
                    <div id="loading-text">Loading..</div>
                </div>
            ) : (
                <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader className="space-y-2 text-center">
                            <CardTitle className="text-3xl font-bold">Welcome to <span className="text-[#2f433a]">Zuvy</span></CardTitle>
                            <CardDescription>Sign in to continue your learning journey</CardDescription>
                        </CardHeader>
                        
                        <CardContent>
                            <Tabs defaultValue="google" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="google">Google</TabsTrigger>
                                    <TabsTrigger value="magic">Magic Link</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="google" className="space-y-4">
                                    <div className="flex flex-col space-y-4">
                                        <Button 
                                            onClick={handleGoogleSignIn} 
                                            className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            Continue with Google
                                        </Button>
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="magic" className="space-y-4">
                                    {!magicLinkSent ? (
                                        <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                                <Input 
                                                    id="email"
                                                    type="email" 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)} 
                                                    placeholder="Enter your email" 
                                                    required
                                                />
                                            </div>
                                            <Button 
                                                type="submit" 
                                                className="w-full bg-[#2f433a]" 
                                                disabled={loading}
                                            >
                                                {loading ? 'Sending...' : 'Send Magic Link'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-4 space-y-4">
                                            <div className="mb-4 text-7xl">✉️</div>
                                            <h3 className="text-xl font-bold">Check your inbox</h3>
                                            <p className="text-gray-500">We've sent a magic link to {email}</p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-4"
                                                onClick={() => setMagicLinkSent(false)}
                                            >
                                                Try another email
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {/* Keep the background effect from the original login page */}
            <div className="fixed inset-0 -z-10">
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
            </div>
        </>
    )
}

export default LoginPage
