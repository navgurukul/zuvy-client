'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './sidebar'
import { Bell, Menu, Search } from 'lucide-react'
import { getUser } from '@/store/store'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileNavbarRoutes } from './navbar-routes'
import { useLazyLoadedStudentData } from '@/store/store'
import NavbarNotifications from './navbar-notifications'
//Test
const Navbar = () => {
    const { studentData } = useLazyLoadedStudentData()
    const { user, setUser } = getUser()
    const rolesList =
        user && (user.rolesList.length === 0 ? 'student' : user.rolesList[0])

    return (
        <nav className="bg-muted fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center justify-between border-green-[#2f433a]">
                <div className="flex items-center">
                    <Sheet>
                        <SheetTrigger>
                            <div className="bg-white p-4 rounded-r-lg">
                                <Menu />
                            </div>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="w-[280px] sm:w-[540px]"
                        >
                            <Sidebar />
                        </SheetContent>
                    </Sheet>
                    <Link href={`/${rolesList}`} className="flex z-40 ">
                        <Image
                            src={'/logo.PNG'}
                            alt="logo"
                            // className="py-2"
                            width={'70'}
                            height={'70'}
                        />
                    </Link>
                </div>
                <div className="mr-2 px-2">
                    <div className="sm:items-center space-x-4 hidden md:flex">
                        {/* <Search /> */}
                        {/* <Bell /> */}
                        {/* {rolesList === 'student' && <NavbarNotifications />} */}
                        <Link href="/profile">
                            <Avatar>
                                <AvatarImage
                                    src={studentData?.profile_picture}
                                    alt="user profile pic"
                                />
                                <AvatarFallback>
                                    {
                                        <Image
                                            src="https://avatar.iran.liara.run/public/boy?username=Ash"
                                            alt="user_profile_pic"
                                            width={30}
                                            height={30}
                                        />
                                    }
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger>
                                <Avatar>
                                    <AvatarImage
                                        src={studentData?.profile_picture}
                                    />
                                    <AvatarFallback>
                                        {
                                            <Image
                                                src="https://avatar.iran.liara.run/public/boy?username=Ash"
                                                alt="user_profile_pic"
                                                width={30}
                                                height={30}
                                            />
                                        }
                                    </AvatarFallback>
                                </Avatar>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-[280px] sm:w-[540px]"
                            >
                                <MobileNavbarRoutes />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
            {/* </MaxWidthWrapper> */}
        </nav>
    )
}

export default Navbar