'use client'
import { useEffect, useState } from 'react'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { usePathname, useRouter } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getUser } from '@/store/store'
// import { Spinner } from '@/components/ui/spinner'
import '../globals.css'
import StudentNavbar from '../_components/navbar'
import { useRoles } from '@/app/[admin]/hooks/useRoles'
import { useAllCourses } from './hooks/useAllCourses'
import Notfound from '../not-found'

// Decode the secure_typeuser cookie value → role string
function decodeRoleCookie(raw: string | undefined): string {
    if (!raw || raw === 'false') return ''
    try {
        const stripped = raw.replace(/^"|"$/g, '') // strip JSON.stringify outer quotes
        return atob(stripped).toLowerCase()
    } catch {
        return ''
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { refetchAllCourses } = useAllCourses(true)
    const pathname = usePathname()
    const { roles, loading } = useRoles()
    const { user } = getUser()
    const router = useRouter()

    // Read the role from the cookie only on the client after mount.
    // This avoids SSR hydration mismatch (server has no browser cookies).
    // Re-reads on every pathname change so it's always fresh after an org switch.
    // The cookie (secure_typeuser) is set synchronously in useSwitchOrg BEFORE
    // router.push fires — so it always has the new role, unlike the Zustand
    // persist store which can lag behind by 50-200ms after router.refresh().
    const [cookieRole, setCookieRole] = useState<string>('')
    useEffect(() => {
        const raw = document.cookie
            .split('; ')
            .find(row => row.startsWith('secure_typeuser='))
            ?.split('=')[1]
        setCookieRole(decodeRoleCookie(raw ? decodeURIComponent(raw) : undefined))
    }, [pathname])

    const roleFromPath = pathname.split('/')[1]?.toLowerCase() || ''
    const userRole = cookieRole || user?.rolesList?.[0]?.toLowerCase() || ''
    const isRoleInSystem = roles?.some(r => r.name?.toLowerCase() === roleFromPath)
    const isMentorsRoute = pathname.includes('/mentorsDashboard')

    const adminAssessmentPreviewRoute = pathname?.includes('/preview')
    const isFullWidthRoute =
        pathname.includes('/module') || pathname.includes('/project') || adminAssessmentPreviewRoute

    const isAssessmentRouteClasses = (route: string) => {
        const adminRoutes = /admin.*courses.*module.*chapters/
        return adminRoutes.test(route || '') ? 'overflow-hidden' : ''
    }
    if ((pathname === '/' || pathname.trim() === '') && userRole !== 'false') {
        // return  router.push(`/${userRole}/courses`)
         return (
            <Notfound
                error={new Error('Unauthorized access')}
                reset={() => console.error('URL Not Found')}
            />
        )
    }

    if(roleFromPath === userRole) {
            // ✅ Authorized user
    return (
        // <div className={isFullWidthRoute ? '' : 'container mx-auto px-2 pt-2 pb-2 max-w-7xl'}>
        <div className='font-body'>
            <div className={isAssessmentRouteClasses(pathname)}>
                {!adminAssessmentPreviewRoute && <StudentNavbar />}
                <div
                    className={`${adminAssessmentPreviewRoute ? '' : isMentorsRoute ? 'pt-28' : 'pt-16'} h-screen flex-1`}
                >
                    {children}
                </div>
            </div>
        </div>
    )
    }

    // cookieRole is '' on the very first render (before useEffect fires),
    // or while user/roles are still loading — hold here, never flash unauthorized
    if (!cookieRole || user.email.length === 0 || loading) {
        return (
            <div className="flex items-center justify-center h-[680px] font-manrope">
                {/* <Spinner className="text-[rgb(81,134,114)]" /> */}
            </div>
        )
    }

    // Role doesn't exist in this org at all
    if (!isRoleInSystem) {
        return (
            <Notfound
                error={new Error('Unauthorized access')}
                reset={() => console.error('URL Not Found')}
            />
        )
    }

    // Genuinely unauthorized for this route
    if (userRole !== roleFromPath) {
        return <UnauthorizedUser userRole={userRole} roleFromPath={roleFromPath} />
    }
}
