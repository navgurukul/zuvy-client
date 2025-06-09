import { deleteCookie } from './deleteCookie' // adjust the path as needed
import { toast } from '@/components/ui/use-toast'

export const Logout = () => {
    localStorage.clear()
    // delete the cookie by setting it to a date in the past:-
    document.cookie =
        'secure_typeuser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    toast.success({
        title: 'Logout Successful',
        description: 'Goodbye, See you soon!',
    })
    
    // Add delay before redirect to let toast show
    setTimeout(() => {
        window.location.pathname = '/'
    }, 1500) 
}