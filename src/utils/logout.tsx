import { toast } from '@/components/ui/use-toast'
import { db } from '@/lib/indexDb'
import { api } from '@/utils/axios.config'
import { clearAuthEntryRoute, getAuthEntryRoute } from '@/utils/authEntryRoute'
// import axios from 'axios'

export const Logout = async () => {
    // const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL

    const access_token = localStorage.getItem('access_token')
    const storedAuth = localStorage.getItem('AUTH')
    let isEmaillessStudent = false

    if (storedAuth) {
        try {
            const user = JSON.parse(storedAuth)
            const roles = Array.isArray(user?.rolesList)
                ? user.rolesList.map((role: unknown) => String(role).toLowerCase())
                : []
            const email = typeof user?.email === 'string' ? user.email.trim() : ''
            isEmaillessStudent = roles.includes('student') && !email
        } catch (error) {
            console.error('Unable to determine logout destination:', error)
        }
    }

    try {
        // const response = await axios.post(
        //     `${mainUrl}/auth/logout`,
        //     {}, // empty body
        //     {
        //         headers: {
        //             Authorization: `Bearer ${access_token}`,
        //             Accept: 'application/json', // optional but matches Swagger
        //         },
        //     }
        // )

        const response = await api.post(`/auth/logout`, {})
        const authEntryRoute = getAuthEntryRoute()

        toast.success({
            title: 'Logout Successful',
            description: 'Goodbye, See you soon!',
        })

        // Preserve theme preference before clearing
        const themeStorage = localStorage.getItem('student-theme-storage')
        
        // Clear localStorage first
        localStorage.clear()
        db.permissions.clear()
        
        // Restore theme preference
        if (themeStorage) {
            localStorage.setItem('student-theme-storage', themeStorage)
        }

        // Delete auth and redirect cookies
        document.cookie =
            'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie =
            'redirectedUrl=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        clearAuthEntryRoute()

        // Reset to the app root without preserving any previous query params,
        // such as ?chapterId=5057 from the protected route redirect flow.
        const logoutRoute = isEmaillessStudent ? '/careertours/signup' : authEntryRoute
        window.location.assign(`${window.location.origin}${logoutRoute}`)
    } catch (error) {
        console.error('Logout error:', error)
    }
}