import { deleteCookie } from './deleteCookie' // adjust the path as needed
import { toast } from '@/components/ui/use-toast'
import { api, apiMeraki } from '@/utils/axios.config'
import axios from 'axios'

export const Logout = async () => {
    console.log('Heeyyyyy')

    const access_token = localStorage.getItem('access_token')

    // Clear localStorage first
    // localStorage.clear()

    // // Delete the cookie
    // document.cookie =
    //     'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    try {
        const response = await axios.post(
            `/auth/logout`,
            {},
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${access_token}`,
                },
            }
        )

        console.log('response', response)

        toast({
            title: 'Logout Successful',
            description: 'Goodbye, See you soon!',
            className:
                'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
        })

        // Clear localStorage first
        localStorage.clear()

        // Delete the cookie
        document.cookie =
            'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    } catch (error) {
        console.error('Logout error:', error)
    }

    window.location.pathname = '/'
}
