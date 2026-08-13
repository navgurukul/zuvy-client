import { toast } from '@/components/ui/use-toast'
import { db } from '@/lib/indexDb'
import { api } from '@/utils/axios.config'
// import axios from 'axios'

export const Logout = async () => {
    // const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL

    const access_token = localStorage.getItem('access_token')

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

        toast.success({
            title: 'Logout Successful',
            description: 'Goodbye, See you soon!',
        })

        // Clear localStorage first
        localStorage.clear()
        db.permissions.clear()

        // Delete auth and redirect cookies
        document.cookie =
            'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie =
            'redirectedUrl=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        // Reset to the app root without preserving any previous query params,
        // such as ?chapterId=5057 from the protected route redirect flow.
        window.location.assign(`${window.location.origin}/`)
    } catch (error) {
        console.error('Logout error:', error)
    }
}