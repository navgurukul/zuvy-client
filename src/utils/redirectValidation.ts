// /**
//  * Returns true if it is safe to redirect the given user role to the given URL.
//  *
//  * Rules (matching existing LoginPage.tsx behaviour):
//  * - Null / empty URLs are never valid.
//  * - Absolute URLs (http/https) and protocol-relative URLs (//) are blocked to
//  *   prevent open-redirect attacks.
//  * - `super_admin` users may only be redirected to paths under `/super_admin`.
//  * - All other roles retain the existing permissive behaviour: any relative
//  *   path is allowed.
//  */
// export function isRedirectAllowed(
//     userRole: string,
//     redirectUrl: string | null | undefined
// ): redirectUrl is string {
//     if (!redirectUrl) return false

//     // Block absolute and protocol-relative URLs (open-redirect protection)
//     if (/^https?:\/\//i.test(redirectUrl)) return false
//     if (redirectUrl.startsWith('//')) return false

//     // super_admin must stay within their own section
//     if (userRole === 'super_admin') {
//         return redirectUrl.startsWith('/super_admin')
//     }

//     // All other roles: preserve existing permissive behaviour
//     return true
// }


export function isRedirectAllowed(
    userRole: string,
    redirectUrl: string | null | undefined
): redirectUrl is string {
    if (!redirectUrl) return false

    // Prevent external/protocol-relative redirects
    if (/^https?:\/\//i.test(redirectUrl) || redirectUrl.startsWith('//')) {
        return false
    }

    if (userRole === 'super_admin') {
        return (
            redirectUrl === '/super_admin' ||
            redirectUrl.startsWith('/super_admin/')
        )
    }

    return true
}