import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import StudentNavbar from '../_components/navbar'

import '../globals.css'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <StudentNavbar />
            <MaxWidthWrapper>{children}</MaxWidthWrapper>
        </div>
    )
}
