import Chapter from '@/components/ui/chapter'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                {/* <div className="w-full flex-none"> */}
                {/* <SideNav /> */}
                <Chapter />
            </div>
            {/* <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div> */}
            <div className="flex-grow p-6 md:p-12">{children}</div>
        </div>
    )
}
