import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'
import UnauthorizedUser from '@/components/ui/UnauthorizedUser'
import { getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'

import '../globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])
    return (
        <>
            {user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-secondary" />
                </div>
            ) : user &&
              (user.rolesList.length === 0 ||
                  (user.rolesList.length > 0 &&
                      user.rolesList[0] !== 'instructor')) ? (
                <UnauthorizedUser rolesList={rolesList} />
            ) : (
                <div>
                    <StudentNavbar />
                    <MaxWidthWrapper>{children}</MaxWidthWrapper>
                </div>
            )}
        </>
    )
}
