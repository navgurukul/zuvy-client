'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

const UnauthorizedUser = ({ role }: any) => {
    const router = useRouter()
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
                        className="mx-auto" // Centers the image horizontally
                    />
                    <h1 className="text-xl font-bold text-destructive mt-3">
                        Unauthorized Access
                    </h1>
                    <p className="text-md mt-3 mb-5 capitalize">
                        {`The page is meant to be viewed by Zuvy ${role}. You do
                        not have ${role} access to access this page`}
                    </p>
                    <Button onClick={() => router.push(`/${role}`)}>
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default UnauthorizedUser
