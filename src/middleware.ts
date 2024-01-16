import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/'];
const privateRoutes = ['/student', '/admin'];

export function middleware(request: NextRequest) {
    const user = request.cookies.get("user")?.value ?? "false";
    const isPrivateRoute = privateRoutes.includes(request.nextUrl.pathname);
    const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

    switch (true) {
        case isPrivateRoute && user === "false":
            return NextResponse.rewrite(new URL('/', request.url));
        case isPrivateRoute && user === "student" && request.nextUrl.pathname !== '/student':
            return NextResponse.rewrite(new URL('/student', request.url));
        case isPrivateRoute && user === "admin" && request.nextUrl.pathname !== '/admin':
            return NextResponse.rewrite(new URL('/admin', request.url));
        case isPublicRoute && user !== "false":
            return NextResponse.rewrite(new URL('/', request.url));
        default:
          
            return NextResponse.next();
    }
}