// 'use client'
// import Link from 'next/link'
// import Image from 'next/image'
// import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
// import Sidebar from './sidebar'
// import { Bell, Menu, Search } from 'lucide-react'
// import { getUser } from '@/store/store'

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { MobileNavbarRoutes } from './navbar-routes'
// import { useLazyLoadedStudentData } from '@/store/store'
// import NavbarNotifications from './navbar-notifications'
// //Test
// const Navbar = () => {
//     const { studentData } = useLazyLoadedStudentData()
//     const { user, setUser } = getUser()
//     const rolesList =
//         user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])

//     return (
//         <nav className="bg-muted fixed top-0 left-0 right-0 z-40">
//             <div className="flex items-center justify-between border-green-[#2f433a]">
//                 <div className="flex items-center">
//                     <Sheet>
//                         <SheetTrigger>
//                             <div className="bg-white p-4 rounded-r-lg">
//                                 <Menu />
//                             </div>
//                         </SheetTrigger>
//                         <SheetContent
//                             side="left"
//                             className="w-[280px] sm:w-[540px]"
//                         >
//                             <Sidebar />
//                         </SheetContent>
//                     </Sheet>
//                     <Link href={`/${rolesList}`} className="flex z-40 ">
//                         <Image
//                             src={'/logo.PNG'}
//                             alt="logo"
//                             // className="py-2"
//                             width={'70'}
//                             height={'70'}
//                         />
//                     </Link>
//                 </div>
//                 <div className="mr-2 px-2">
//                     <div className="sm:items-center space-x-4 hidden md:flex">
//                         {/* <Search /> */}
//                         {/* <Bell /> */}
//                         {/* {rolesList === 'student' && <NavbarNotifications />} */}
//                         <Link href="/profile">
//                             <Avatar>
//                                 <AvatarImage
//                                     src={studentData?.profile_picture}
//                                     alt="user profile pic"
//                                 />
//                                 <AvatarFallback>
//                                     {
//                                         <Image
//                                             src="https://avatar.iran.liara.run/public/boy?username=Ash"
//                                             alt="user_profile_pic"
//                                             width={30}
//                                             height={30}
//                                         />
//                                     }
//                                 </AvatarFallback>
//                             </Avatar>
//                         </Link>
//                     </div>
//                     <div className="md:hidden">
//                         <Link href="/profile">
//                             <Avatar>
//                                 <AvatarImage
//                                     src={studentData?.profile_picture}
//                                 />
//                                 <AvatarFallback>
//                                     {
//                                         <Image
//                                             src="https://avatar.iran.liara.run/public/boy?username=Ash"
//                                             alt="user_profile_pic"
//                                             width={30}
//                                             height={30}
//                                         />
//                                     }
//                                 </AvatarFallback>
//                             </Avatar>
//                         </Link>
//                         {/* <Sheet>
//                             <SheetTrigger>
//                             </SheetTrigger> */}
//                         {/* <SheetContent
//                                 side="right"
//                                 className="w-[280px] sm:w-[540px]"
//                             >
//                                 <MobileNavbarRoutes />
//                             </SheetContent> */}
//                         {/* </Sheet> */}
//                     </div>
//                 </div>
//             </div>
//             {/* </MaxWidthWrapper> */}
//         </nav>
//     )
// }

// export default Navbar








'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './sidebar'
import { Bell, Menu, Search } from 'lucide-react'
import { getUser } from '@/store/store'
import { cn } from '@/lib/utils'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileNavbarRoutes } from './navbar-routes'
import { useLazyLoadedStudentData } from '@/store/store'
import NavbarNotifications from './navbar-notifications'
import { Layers, Database, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    commonRoutes,
    guestRoutes,
    adminRoutes,
    teacherRoutes,
} from '@/lib/sidebar-routes'
import { Logout } from '@/utils/logout'
import { getUserInitials } from '@/utils/common'
import { useThemeStore } from '@/store/store'
import { Moon, Sun } from 'lucide-react'
import ProfileDropDown from '@/components/ProfileDropDown'
import QuestionBankDropdown from '@/app/_components/QuestionBankDropdown'

//Test
const Navbar = () => {
    const { studentData } = useLazyLoadedStudentData()
    const { user, setUser } = getUser()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Get all query params as an object
    const queryObject: Record<string, string> = {}

    searchParams.forEach((value, key) => {
        queryObject[key] = value
    })

    const { viewRolesAndPermission, viewContent } = queryObject

    const isAdmin = pathname?.includes('/admin')
    const isTeacher = pathname?.includes('/instructor')
    const routes = isAdmin
        ? adminRoutes
        : isTeacher
        ? teacherRoutes
        : guestRoutes

    const { isDark, toggleTheme } = useThemeStore()
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    const handleLogoutClick = () => {
        setShowLogoutDialog(true)
    }

    const handleLogout = async () => {
        setShowLogoutDialog(false)
        await Logout()
    }

    return (
        <nav className="bg-background fixed top-0 left-0 right-0 z-40 border-b shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-8">
                    {/* Logo and Brand */}
                    <Link href="/admin" className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-lg">
                                Z
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl">
                            Zuvy Admin
                        </h3>
                    </Link>

                    {/* Navigation Items */}
                    <nav className="flex items-center space-x-1">
                        {routes.map((item) => {
                            const Icon = item.icon
                            const canViewContent = viewContent === 'true'
                            const canViewRoles =
                                viewRolesAndPermission === 'true'

                            if (item.name === 'Content Bank' && !canViewContent)
                                return null
                            if (
                                item.name === 'Roles and Permissions' &&
                                !canViewRoles
                            )
                                return null
                            const isActive =
                                typeof item.active === 'function'
                                    ? item.active(pathname)
                                    : item.active === pathname

                            return (
                                <>
                                    {item.name !== 'Question Bank' && (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center space-x-2 px-4 py-2 rounded-lg text-[0.95rem] font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.name}</span>
                                        </Link>
                                    )}
                                    {item.name === 'Question Bank' && (
                                        <QuestionBankDropdown />
                                    )}
                                </>
                            )
                        })}
                    </nav>
                </div>

                {/* Right - Theme Switch and Avatar with Dropdown */}
                <div className="flex items-center gap-2 sm:gap-3 text-left">
                    <Button
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
                    </Button>

                    {/* Admin Avatar with Dropdown */}
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
