import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const userData = request.cookies.get("secure_typeuser")?.value ?? "false";
    const user = userData === "false" ? "false" : atob(userData);
    const matcher = ["/", "/student", "/admin", "/volunteer"];

    if (matcher.includes(request.nextUrl.pathname)) {
        if (user === "false") {
            if (request.nextUrl.pathname.startsWith("/student")) {
                return NextResponse.redirect(new URL("/", request.url));
            }
            if (request.nextUrl.pathname.startsWith("/admin")) {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } else if (user === "student") {
            if (
                request.nextUrl.pathname.startsWith("/") &&
                request.nextUrl.pathname !== "/student"
            ) {
                return NextResponse.redirect(new URL("/student", request.url));
            }
        }
         else if (user === "admin") {
            if (
                request.nextUrl.pathname.startsWith("/") &&
                request.nextUrl.pathname !== "/admin"
            ) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        }
         else if (user === "volunteer") {
            if (
                request.nextUrl.pathname.startsWith("/") &&
                request.nextUrl.pathname !== "/volunteer"
            ) {
                return NextResponse.redirect(new URL("/volunteer", request.url));
            }
        }
    }
}
