import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // const userData = request.cookies.get("secure_typeuser")?.value ?? "false";
    // const user = userData === "false" ? "false" : atob(userData);

    const path = request.nextUrl.href
    const redirectedUrl = request.cookies.get('redirectedUrl')?.value ?? false
    const userData = request.cookies.get('secure_typeuser')?.value ?? 'false'
    let user = 'false'
    try {
        user = userData === 'false' ? 'false' : atob(userData)
    } catch (e) {
        console.error(e)
    }
    const matcher = ['/', '/student', '/admin', '/instructor']
    let decodedUrl = redirectedUrl ? atob(redirectedUrl) : false

    if (user === 'false') {
        if (request.nextUrl.pathname.startsWith('/student')) {
            if (
                path.includes('/student/course') ||
                path.includes('/admin/course') ||
                path.includes('/instructor/course')
            ) {
                const redirectUrl = new URL('/', request.url)
                redirectUrl.searchParams.set('route', request.nextUrl.pathname)
                return NextResponse.redirect(redirectUrl)
            } else {
                const redirectUrl = new URL('/', request.url)
                return NextResponse.redirect(redirectUrl)
            }
        }
        if (request.nextUrl.pathname.startsWith('/admin')) {
            if (
                path.includes('/student/course') ||
                path.includes('/admin/course') ||
                path.includes('/instructor/course')
            ) {
                const redirectUrl = new URL('/', request.url)
                redirectUrl.searchParams.set('route', request.nextUrl.pathname)
                return NextResponse.redirect(redirectUrl)
            } else {
                const redirectUrl = new URL('/', request.url)
                return NextResponse.redirect(redirectUrl)
            }
        }
        if (request.nextUrl.pathname.startsWith('/instructor')) {
            if (
                path.includes('/student/course') ||
                path.includes('/admin/course') ||
                path.includes('/instructor/course')
            ) {
                const redirectUrl = new URL('/', request.url)
                redirectUrl.searchParams.set('route', request.nextUrl.pathname)
                return NextResponse.redirect(redirectUrl)
            } else {
                const redirectUrl = new URL('/', request.url)
                return NextResponse.redirect(redirectUrl)
            }
        }
    }

    if (user !== 'student') {
        if (request.nextUrl.pathname.startsWith('/student')) {
            if (decodedUrl === false) {
                return NextResponse.next()
            }
            if (decodedUrl) {
                console.log('redirect Condition 1')
                const response = NextResponse.redirect(
                    new URL(decodedUrl, request.url)
                )
                response.cookies.set('redirectedUrl', '', {
                    path: '/',
                    maxAge: 60, // Optional: expire after 1 minute
                })
                if (user === 'admin') {
                    return NextResponse.redirect(
                        new URL('/admin/courses', request.url)
                    )
                }
                return response
            } else {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }
    if (user !== 'admin') {
        if (request.nextUrl.pathname.startsWith('/admin')) {
            // If already redirected, avoid redirecting again
            if (decodedUrl === false) {
                return NextResponse.next()
            }
            if (decodedUrl) {
                console.log('redirect Condition 1')
                const response = NextResponse.redirect(
                    new URL(decodedUrl, request.url)
                )
                response.cookies.set('redirectedUrl', '', {
                    path: '/',
                    maxAge: 60, // Optional: expire after 1 minute
                })
                return response
            } else {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }
    if (user !== 'instructor') {
        if (request.nextUrl.pathname.startsWith('/instructor')) {
            if (decodedUrl === false) {
                return NextResponse.next()
            }
            if (decodedUrl) {
                console.log('redirect Condition 1')
                const response = NextResponse.redirect(
                    new URL(decodedUrl, request.url)
                )
                response.cookies.set('redirectedUrl', '', {
                    path: '/',
                    maxAge: 60, // Optional: expire after 1 minute
                })
                if (user === 'admin') {
                    return NextResponse.redirect(
                        new URL('/admin/courses', request.url)
                    )
                }
                return response
            } else {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
    }

    if (matcher.includes(request.nextUrl.pathname)) {
        if (user === 'false') {
            if (request.nextUrl.pathname.startsWith('/student')) {
                return NextResponse.redirect(new URL('/', request.url))
            }
            if (request.nextUrl.pathname.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/', request.url))
            }
        } else if (decodedUrl && user !== 'admin') {
            console.log('redirect Condition 2')
            const absoluteUrl = new URL(decodedUrl, request.url) // Construct the full URL
            const response = NextResponse.redirect(absoluteUrl)
            // Set a cookie to track the redirect
            response.cookies.set('redirectedUrl', '', {
                path: '/',
                maxAge: 60, // Optional: expire after 1 minute
            })
            return response
        } else if (user === 'student') {
            if (
                request.nextUrl.pathname.startsWith('/') &&
                request.nextUrl.pathname !== '/student'
            ) {
                return NextResponse.redirect(new URL('/student', request.url))
            }
        } else if (user === 'admin') {
            if (
                request.nextUrl.pathname.startsWith('/') &&
                request.nextUrl.pathname !== '/admin'
            ) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        } else if (user === 'instructor') {
            if (
                request.nextUrl.pathname.startsWith('/') &&
                request.nextUrl.pathname !== '/instructor'
            ) {
                return NextResponse.redirect(
                    new URL('/instructor', request.url)
                )
            }
        }
    }
}
