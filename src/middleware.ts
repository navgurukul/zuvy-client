import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { usePathname } from 'next/navigation'

export function middleware(request: NextRequest) {
    // const userData = request.cookies.get("secure_typeuser")?.value ?? "false";
    // const user = userData === "false" ? "false" : atob(userData);

    const path = request.nextUrl.href
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
    const orgName = pathname.split('/')[2]

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
        //   path.includes('/student/course') ||
        //   path.includes('/admin/course') ||
        //   path.includes('/instructor/course')

        const redirectUrl = new URL('/', request.url)

       // if course path present, add route param
       if (hasCoursePath) {
        redirectUrl.searchParams.set('route', pathname)
       }

       return NextResponse.redirect(redirectUrl)
      }
    }

    const handleUnauthorized = (role: string) => {
        if (!pathname.startsWith(`/${role}`)) return null

        if (!decodedUrl) return NextResponse.next()

        if (decodedUrl) {
            const response = NextResponse.redirect(new URL(decodedUrl, request.url))
            response.cookies.set('redirectedUrl', '', {
                path: '/',
                maxAge: 60, // 1 min
            })

            // special case: admin visiting another role’s page
            if (user === 'admin') {
                return NextResponse.redirect(new URL(`/admin/${orgName}/courses`, request.url))
            }

            return response
        }

        return NextResponse.redirect(new URL('/', request.url))
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
            // For any non-student role, always redirect to /${user}/courses if pathname is / or /${user}
            if (
                request.nextUrl.pathname === '/' ||
                request.nextUrl.pathname === `/${user}`
            ) {
                return NextResponse.redirect(new URL(`/${user}/${orgName}/courses`, request.url))
            }
        }
    }
}