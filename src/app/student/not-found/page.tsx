'use client'

import Notfound from '@/app/not-found'

/**
 * Rendered whenever a student navigates to an unknown /student/* route
 * (e.g. /student/organizations/1/courses, /student/admin, etc.).
 * The middleware rewrites those URLs to this page so the browser URL stays
 * unchanged while the user sees the standard "There was a problem" error page.
 */
export default function StudentNotFound() {
    return (
        <Notfound
            error={new Error('Page not found')}
            reset={() => {}}
        />
    )
}
