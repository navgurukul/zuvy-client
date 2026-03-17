'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { getUser } from '@/store/store'
import { useUnauthorizedModalStore, unauthorizedMessage } from '@/store/session.store'

const NotAuthorizedUser = () => {
    const router = useRouter()
    const { setShowModal } = useUnauthorizedModalStore()
    const { message } = unauthorizedMessage()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const orgId = user?.orgId;

    return (
        <div className="flex flex-col items-center pt-24 w-full h-full">
            {/* Set a smaller max width for the main container */}
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <Image
                        src="/unauthorized-user.svg"
                        alt="User Not Authorized"
                        width={180}
                        height={180}
                        className="mx-auto"
                    />
                    <h1 className="text-xl font-bold text-destructive mt-3">
                        Unauthorized Access
                    </h1>
                    <p className="text-md mt-3 mb-5 capitalize">
                        {message}
                    </p>
                    <Button onClick={() => {
                        setShowModal(false);
                        router.push(`/${userRole}/organizations/${orgId}/courses`);
                    }}>
                        Return to my Organisation
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotAuthorizedUser
