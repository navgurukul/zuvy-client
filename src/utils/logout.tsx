import { toast } from '@/components/ui/use-toast'
import { api } from '@/utils/axios.config'
// import axios from 'axios'

export const Logout = async () => {
    // console.log('Heeyyyyy')
    // const mainUrl = process.env.NEXT_PUBLIC_MAIN_URL

    const access_token = localStorage.getItem('access_token')

    try {
        // console.log('access_token', access_token)
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

        // Delete the cookie
        document.cookie =
            'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        window.location.pathname = '/'
    } catch (error) {
        console.error('Logout error:', error)
    }
}
