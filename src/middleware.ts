import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // const userData = request.cookies.get("secure_typeuser")?.value ?? "false";
    // const user = userData === "false" ? "false" : atob(userData);

    const redirectedUrl = request.cookies.get('redirectedUrl')?.value ?? null
    console.log('redirectedUrl cookie:', redirectedUrl)
    const userData = request.cookies.get('secure_typeuser')?.value ?? 'false'
    let user = 'false'
    try {
        user = userData === 'false' ? 'false' : atob(userData)
    } catch (e) {
        console.error(e)
    }
    const matcher = ['/', '/student', '/admin', '/instructor']
    const decodedUrl = redirectedUrl ? atob(redirectedUrl) : null
    const pathname = request.nextUrl.pathname
    const roles = ['student', 'admin', 'instructor']
    const pathSegments = pathname.split('/')
    const orgIdFromPath = pathSegments[2] === 'organizations' && pathSegments[3] && pathSegments[3] !== 'undefined' && pathSegments[3] !== 'null' ? pathSegments[3] : undefined
    const orgIdFromCookie = request.cookies.get('orgId')?.value
    const validOrgIdFromCookie = orgIdFromCookie && orgIdFromCookie !== 'undefined' && orgIdFromCookie !== 'null' ? orgIdFromCookie : undefined
    const orgId = orgIdFromPath || validOrgIdFromCookie

   if (user === 'false') {
      
      const isProtectedRoute =
         pathname.startsWith('/student') ||
         pathname.startsWith('/admin') ||
         pathname.startsWith('/instructor')

       if (isProtectedRoute) {
        const hasCoursePath =
            pathname.startsWith('/student/') ||
            pathname.startsWith('/admin/') ||
            pathname.startsWith('/super_admin/') ||
            pathname.startsWith('/instructor/')

        const redirectUrl = new URL('/', request.url)

       // if course path present, add route param
       if (hasCoursePath) {
        redirectUrl.searchParams.set('route', pathname)
       }

       return NextResponse.redirect(redirectUrl)
      }
    }

    // ─── Student route whitelist ───────────────────────────────────────────────
    // Only students should be checked; other roles have their own layout guards.
    if (user === 'student' && pathname.startsWith('/student/')) {
        const VALID_STUDENT_PREFIXES = [
            '/student/course/',
            '/student/mentors',
            '/student/profile',
            '/student/sessions',
            '/student/reactplayground',
            '/student/not-found',   // allow the error page itself
        ]
        const isValidStudentPath = VALID_STUDENT_PREFIXES.some(prefix =>
            pathname.startsWith(prefix)
        )
        if (!isValidStudentPath) {
            // Unknown student sub-path — show the "There was a problem" error page
            return NextResponse.rewrite(new URL('/student/not-found', request.url))
        }
    }

    const handleUnauthorized = (role: string) => {
        // Only intercept if the request path belongs to this role
        if (!pathname.startsWith(`/${role}`)) return null

        // User is visiting a route that belongs to a different role
        // Redirect them to their own home so the layout's role guard shows the error page
        if (user !== role) {
            if (decodedUrl) {
                // Admin visiting another role's page with a redirect cookie
                if (user === 'admin') {
                    const response = NextResponse.redirect(
                        new URL(
                            orgId
                                ? `/admin/organizations/${orgId}/courses`
                                : `/admin/organizations`,
                            request.url
                        )
                    )
                    response.cookies.set('redirectedUrl', '', { path: '/', maxAge: 60 })
                    return response
                }

                const response = NextResponse.redirect(new URL(decodedUrl, request.url))
                response.cookies.set('redirectedUrl', '', { path: '/', maxAge: 60 })
                return response
            }

            // No redirect cookie — bounce them straight to their own role's home.
            // The layout guard will render the "There was a problem" error page
            // if they somehow reach a route that doesn't match their role.
            if (user === 'false') {
                // Unauthenticated — send to login
                return NextResponse.redirect(new URL('/', request.url))
            }
            // Authenticated but wrong role — redirect to their own home
            if (user === 'admin') {
                return NextResponse.redirect(
                    new URL(
                        orgId
                            ? `/admin/organizations/${orgId}/courses`
                            : `/admin/organizations`,
                        request.url
                    )
                )
            }
            return NextResponse.redirect(new URL(`/${user}`, request.url))
        }

        return null
    }

    for (const role of roles) {
        if (user !== role) {
            const result = handleUnauthorized(role)
            if (result) return result
        }
    }


    if (matcher.includes(request.nextUrl.pathname)) {
        if (user === 'false') {
            if (['/student', '/admin'].some(role => request.nextUrl.pathname.startsWith(role))) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } else if (decodedUrl && user !== 'admin') {
            const absoluteUrl = new URL(decodedUrl, request.url)
            const response = NextResponse.redirect(absoluteUrl)
            response.cookies.set('redirectedUrl', '', {
                path: '/',
                maxAge: 60,
            })
            return response
        } else if (user === 'student') {
            if (
                request.nextUrl.pathname.startsWith('/') &&
                request.nextUrl.pathname !== '/student'
            ) {
                return NextResponse.redirect(new URL('/student', request.url))
            }
        } else {
            // For any non-student role, redirect to courses if orgId exists, else to organizations list
            if (
                request.nextUrl.pathname === '/' ||
                request.nextUrl.pathname === `/${user}`
            ) {
                if (orgId) {
                    return NextResponse.redirect(new URL(`/${user}/organizations/${orgId}/courses`, request.url))
                } else {
                    return NextResponse.redirect(new URL(`/${user}/organizations`, request.url))
                }
            }
        }
    }
}