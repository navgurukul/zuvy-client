'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import Sidebar from './sidebar'
import { Bell, Menu, Search } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileNavbarRoutes } from './navbar-routes'
import { useLazyLoadedStudentData } from '@/store/store'

const Navbar = () => {
    const { studentData } = useLazyLoadedStudentData()
    return (
        <nav className="bg-muted">
            {/* <MaxWidthWrapper> */}
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
                    <Link href={'/'} className="flex z-40 ">
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
                        <Link href="/profile">
                            <Avatar>
                                <AvatarImage
                                    src={studentData?.profile_picture}
                                />
                                <AvatarFallback>NAME</AvatarFallback>
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
                                    <AvatarFallback>NAME</AvatarFallback>
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
