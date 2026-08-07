'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter, useParams } from 'next/navigation'
import { getUser } from '@/store/store'
import { useEffect } from 'react'

const UnauthorizedUser = ({ userRole, roleFromPath }: { userRole?: string; roleFromPath?: string }) => {
    const router = useRouter()
    const { organizationId } = useParams()
    const { user } = getUser()
    const rawOrgId = user?.orgId || (organizationId && organizationId !== 'undefined' ? organizationId : null);
    const validOrgId = rawOrgId && String(rawOrgId) !== 'NaN' && String(rawOrgId) !== 'undefined' ? rawOrgId : null;

    return (
        <div className="flex flex-col items-center pt-24">
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
                        {`The page is meant to be viewed by ${roleFromPath}. You do
                        not have ${roleFromPath} access to access this page`}
                    </p>
                    <Button onClick={() => {
                        if (userRole && validOrgId) {
                            router.push(`/${userRole}/organizations/${validOrgId}/courses`);
                        } else if (userRole) {
                            router.push(`/${userRole}/organizations`);
                        } else {
                            router.push(`/`);
                        }
                    }}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UnauthorizedUser
