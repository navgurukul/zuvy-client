'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { getUser } from '@/store/store'
import { useUnauthorizedModalStore } from '@/store/unauthorized.store'

const NotAuthorizedUser = () => {
    const router = useRouter()
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
                        {/* {`The page is meant to be viewed with specific permissions. You do
                        not have access to view this page.`} */}
                        This page is accessible only to Genisys Group Admins. You are currently associated with the NG organization and do not have permission to view this page.
                    </p>
                    <Button onClick={() => {
                        useUnauthorizedModalStore.getState().setShowModal(false);
                        router.push(`/${userRole}/organizations/${orgId || user?.orgId}/courses`);
                    }}>
                        Return to my Organisation
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default NotAuthorizedUser
