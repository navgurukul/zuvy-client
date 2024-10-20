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
            <div className="sticky top-0 z-50">
                <StudentNavbar />
            </div>
            <MaxWidthWrapper className="relative">{children}</MaxWidthWrapper>
        </div>
    )
}
