'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Sidebar from './sidebar';
import { Bell, Menu, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileNavbarRoutes } from './navbar-routes';
import { useLazyLoadedStudentData } from '@/store/store';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
    const { studentData } = useLazyLoadedStudentData();
    const [showNotifications, setShowNotifications] = useState(false);

    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Your assignment is due tomorrow.', read: false },
        { id: 2, message: 'New update available in the app.', read: false },
        { id: 3, message: 'Reminder: Meeting at 3 PM today.', read: true },
        { id: 4, message: 'Reminder: Meeting at 4 PM tomorrow.', read: false },
    ]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const notificationRef = useRef<HTMLDivElement>(null);

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const markAsRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, read: true }))
        );
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target as Node)
            ) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-muted fixed top-0 left-0 right-0 z-40">
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
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={toggleNotifications}
                                className="p-2 rounded-full hover:bg-gray-200 relative"
                            >
                                <Bell />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 bg-red-600 text-white text-xs rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg">
                                    <div className="p-2 border-b flex justify-between items-center">
                                        <span className="font-semibold">Notifications</span>
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                    <ul className="p-2 space-y-2">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <li
                                                    key={notification.id}
                                                    className={`p-2 border-b last:border-none ${notification.read
                                                            ? 'text-gray-500'
                                                            : 'font-semibold text-black'
                                                        } hover:bg-gray-100`}
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    {notification.message}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-2 text-gray-500">
                                                No new notifications.
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

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
    );
};

export default Navbar;
