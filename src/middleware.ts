import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/'];
const privateRoutes = ['/student', '/admin'];

export function middleware(request: NextRequest) {
    const user = request.cookies.get("user")?.value ?? "false";
    const   matcher = ['/', '/student','/admin']

    if(matcher.includes(request.nextUrl.pathname)) {
    if (user === "false") {
        if (request.nextUrl.pathname.startsWith('/student')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        if (request.nextUrl.pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    } else if (user === "student") {
        if (request.nextUrl.pathname.startsWith('/') && request.nextUrl.pathname !== '/student') {
            return NextResponse.redirect(new URL('/student', request.url));
        }
    } else if (user === "admin") {
        if (request.nextUrl.pathname.startsWith('/') && request.nextUrl.pathname !== '/admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }
}