'use client'

import Link from 'next/link'
import {
    Layers,
    Settings,
    Database,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLazyLoadedStudentData } from '@/store/store'
import { Button } from '@/components/ui/button'
import { Logout } from '@/utils/logout'
import { useThemeStore } from '@/store/store'
import { Moon, Sun } from 'lucide-react'
import ProfileDropDown from '@/components/ProfileDropDown'
import QuestionBankDropdown from '@/app/_components/QuestionBankDropdown'
import { getPermissions } from '@/lib/GetPermissions'
import { Spinner } from '@/components/ui/spinner'
import OrganizationDropdown from './organizationDropdown'
import { Badge } from '@/components/ui/badge'

//Test
const Navbar = () => {
    const { studentData } = useLazyLoadedStudentData()
    const pathname = usePathname()
    const role = pathname.split('/')[1]
    const orgName = pathname.split('/')[2]
    const inOrg = pathname.split('/')[2] !== 'organizations'
    const superAdmin = false
    // const role = user.rolesList[0]
    const [permissions, setPermissions] = useState<Record<string, boolean>>({})
    const { isDark, toggleTheme } = useThemeStore()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)
    const [loading, setLoading] = useState(true);

    const handleLogoutClick = () => {
        setShowLogoutDialog(true)
    }

    const handleLogout = async () => {
        setShowLogoutDialog(false)
        await Logout()
    }

    const superAdminRoutes = [
        {
            name: 'Organizations',
            href: `/${role}/organizations`,
            icon: Layers,
            active: (pathname: string) =>
                pathname === `/${role}/organizations` || pathname.startsWith(`/${role}/organizations/`),
        },
    ]

    const adminRoutes = [
        {
            name: 'Course Studio',
            href: `/${role}/${orgName}/courses`,
            icon: Layers,
            active: (pathname: string) =>
                pathname === `/${role}/${orgName}/courses` || pathname.startsWith(`/${role}/${orgName}/courses/`),
        },
        {
            name: 'Question Bank',
            href: `/${role}/content-bank`,
            icon: Database,
            active: `/${role}/content-bank`,
        },
        {
            name: 'Roles and Permissions',
            href: `/${role}/${orgName}/settings`,
            icon: Settings,
            active: `/${role}/${orgName}/settings`,
        },
        {
            name: 'All Organizations',
            href: `/${role}/organizations`,
            icon: Layers,
            active: (pathname: string) =>
                pathname === `/${role}/organizations` || pathname.startsWith(`/${role}/organizations/`),
        },
    ]

    // const routes = superAdmin && !pathname.includes("course") ? superAdminRoutes : superAdmin && pathname.includes("course") ? adminRoutes : adminRoutes;

    const routes = inOrg ? adminRoutes : superAdminRoutes;

    useEffect(() => {
        (async () => {
            const perms = await getPermissions();
            setPermissions(perms);
        })().then(() => setLoading(false));
    }, [permissions]);

    return (
        <nav className="bg-background fixed top-0 left-0 right-0 z-40 border-b shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    {/* Logo and Brand */}
                    <Link href={`/${role}/courses`} className="flex items-center space-x-3">
                          <Image src={'/zuvy-logo-horizontal.png'} height={100} width={100} alt='zuvylogo'/>
                    </Link>

                    <OrganizationDropdown orgName={orgName} />

                    {/* Navigation Items */}
                    <nav className="flex items-center space-x-1">
                        {routes.map((item) => {
                            const Icon = item.icon

                            const isActive =
                                typeof item.active === 'function'
                                    ? item.active(pathname)
                                    : item.active === pathname

                            // Check permissions for Question Bank and Roles and Permissions
                            if (item.name === 'Question Bank' && !permissions.viewQuestion) {
                                return null;
                            }
                            if (item.name === 'Roles and Permissions' && !permissions.viewRolesAndPermission) {
                                return null;
                            }

                            // const superAdminOnly = item.name === 'All Organizations' 
                            // console.log('superAdmin', superAdmin)
                            // console.log('superAdmin && item.name === All Organizations', superAdmin && item.name === 'All Organizations')
                            // console.log('superAdmin && item.name !== All Organizations', superAdmin && item.name !== 'All Organizations')
                            // console.log('superAdmin && item.name === All Organizations || item.name !== Question Bank', superAdmin && item.name === 'All Organizations' || item.name !== 'Question Bank')

                            return (
                                <>
                                    {/* {superAdmin && item.name === 'All Organizations' && (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center space-x-2 px-4 py-2 rounded-lg text-[0.95rem] font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {loading? <Spinner />: <span className='' >{item.name}</span>}
                                        </Link>
                                    )} */}
                                    {/* {(superAdmin && item.name !== 'All Organizations' ) || item.name !== 'Question Bank' && ( */}
                                    {item.name !== 'Question Bank' && (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center space-x-2 px-4 py-2 rounded-lg text-[0.95rem] font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {loading? <Spinner />: <span className='' >{item.name}</span>}
                                        </Link>
                                    )}
                                    {item.name === 'Question Bank' && permissions.viewQuestion && (
                                        loading ? <Spinner /> : <QuestionBankDropdown/>
                                    )}
                                </>
                            )
                        })}
                    </nav>
                </div>

                {/* Right - Theme Switch and Avatar with Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 text-left">

                    {/* Role Badge */}
                    {/* {studentData?.rolesList?.[0] && (
                        <div className="hidden sm:flex items-center px-4 py-1 bg-violet-50 text-violet-700 border-violet-200 rounded-full text-sm font-medium border border-primary/20">
                            <span className="capitalize">{studentData.rolesList[0]}</span>
                        </div>
                    )} */}
                    <Badge
                        // variant="yellow"
                        className="py-1 px-4 text-sm font-medium bg-violet-50 text-violet-700 border border-violet-200"
                    >
                        {role}
                    </Badge>

                    {/* Setting Tab - Only for Admin and POC */}
                    {/* {studentData?.rolesList?.[0] === 'poc' && ( */}
                    {inOrg && (studentData?.rolesList?.[0] === 'admin' || studentData?.rolesList?.[0] === 'poc') && (
                        <Link
                            href={`/${role}/${orgName}/setting`}
                            className={cn(
                                'flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                                pathname === `/${role}/${orgName}/setting`
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                            )}
                        >
                            <Settings className="h-4 w-4" />
                            <span>Setting</span>
                        </Link>
                    )}
                    
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="w-8 h-8 sm:w-9 sm:h-9 p-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {isDark ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button> */}

                    {/* Profile Avatar with Dropdown */}
                    <ProfileDropDown
                        studentData={studentData}
                        handleLogoutClick={handleLogoutClick}
                        showLogoutDialog={showLogoutDialog}
                        setShowLogoutDialog={setShowLogoutDialog}
                        handleLogout={handleLogout}
                    />
                </div>
            </div>
        </nav>
    )
}

export default Navbar
