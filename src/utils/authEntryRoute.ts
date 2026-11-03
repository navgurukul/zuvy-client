const AUTH_ENTRY_ROUTES = new Set(['/', '/careertours/signup'])

export function rememberAuthEntryRoute() {
    if (typeof window === 'undefined') return

    try {
        const route = window.location.pathname
        if (AUTH_ENTRY_ROUTES.has(route)) {
            window.sessionStorage.setItem('auth_entry_route', route)
        }
    } catch {
        // Session storage can be disabled by the browser.
    }
}

export function getAuthEntryRoute() {
    if (typeof window === 'undefined') return '/'

    try {
        const route = window.sessionStorage.getItem('auth_entry_route')
        if (route && AUTH_ENTRY_ROUTES.has(route)) return route
    } catch {
        // Fall back to the Google login page if session storage is unavailable.
    }

    return '/'
}

export function clearAuthEntryRoute() {
    if (typeof window === 'undefined') return

    try {
        window.sessionStorage.removeItem('auth_entry_route')
    } catch {
        // Nothing else to clear when session storage is unavailable.
    }
}
