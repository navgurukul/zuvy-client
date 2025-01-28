// import { useEffect, useState } from 'react';
// import Image from 'next/image';

// interface Notification {
//     id: number;
//     message: string;
//     time: string;
//     read: boolean;
// }
// //Replace the dummy with the live notifications from BE apis
// const NavbarNotifications = () => {
//     const [showNotifications, setShowNotifications] = useState(false);
//     const [notifications, setNotifications] = useState<Notification[]>([
//         {
//             id: 1,
//             message: 'Your assignment is due tomorrow.',
//             time: '5 mins ago',
//             read: false,
//         },
//         {
//             id: 2,
//             message: 'New update available in the app.',
//             time: '30 mins ago',
//             read: false,
//         },
//         {
//             id: 3,
//             message: 'Reminder: Meeting at 3 PM today.',
//             time: '1 hr ago',
//             read: true,
//         },
//         {
//             id: 4,
//             message: 'New Batch Enrollment: Web Fundamentals April 2024',
//             time: '2 hrs ago',
//             read: false,
//         },
//         {
//             id: 5,
//             message: 'Course completion certificate is now available.',
//             time: '4 hrs ago',
//             read: false,
//         },
//         {
//             id: 6,
//             message: 'You have a new message in your inbox.',
//             time: '1 day ago',
//             read: true,
//         },
//         {
//             id: 7,
//             message: 'System maintenance scheduled for tomorrow.',
//             time: '2 days ago',
//             read: false,
//         },
//         {
//             id: 8,
//             message: 'Your feedback on the course is requested.',
//             time: '2 days ago',
//             read: false,
//         },
//         {
//             id: 9,
//             message: 'System maintenance scheduled .',
//             time: '3 days ago',
//             read: false,
//         },
//         {
//             id: 10,
//             message: 'Your feedback is requested 1.',
//             time: '3 days ago',
//             read: false,
//         },
//         {
//             id: 11,
//             message: 'Your feedback is requested 2.',
//             time: '3 days ago',
//             read: false,
//         },
//         {
//             id: 12,
//             message: 'Your feedback is requested 3.',
//             time: '4 days ago',
//             read: false,
//         },
//     ]);

//     const unreadCount = notifications.filter((n) => !n.read).length;

//     const toggleNotifications = () => {
//         setShowNotifications((prev) => !prev);
//     };

//     const markAsRead = (id: number) => {
//         setNotifications((prev) =>
//             prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//         );
//     };

//     const markAllAsRead = () => {
//         setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//     };

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             const dropdown = document.getElementById('notifications-dropdown');
//             if (
//                 dropdown &&
//                 !dropdown.contains(event.target as Node) &&
//                 !(event.target as HTMLElement).closest('.notification-trigger')
//             ) {
//                 setShowNotifications(false);
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     const NotificationsFeedEmpty = () => {
//         // Check if there are any notifications
//         const noNotifications = notifications.length === 0;

//         return (
//             <div className="flex flex-col items-center">
//                 <Image
//                     src="/no-notifications.svg"
//                     alt="No Notifications"
//                     width={164}
//                     height={120}
//                     className="mb-6"
//                 />
//                 <p className="text-gray-600">
//                     {noNotifications
//                         ? 'There are no notifications. We will notify you of all the important events in your learning journey.'
//                         : 'You have caught up with all the notifications.'}
//                 </p>
//             </div>
//         );
//     };

//     return (
//         <div className="relative">
//             {/* Bell Icon */}
//             <button
//                 onClick={toggleNotifications}
//                 className={`p-2 rounded-full hover:bg-gray-200 relative notification-trigger ${showNotifications ? 'border-2 border-[#DCE7E3] bg-[#DCE7E3]' : ''
//                     }`}
//             >
//                 <Image
//                     src={showNotifications ? '/notifications (1).svg' : '/notifications.svg'}
//                     alt="Notifications"
//                     width={24}
//                     height={24}
//                 />
//                 {unreadCount > 0 && (
//                     <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 bg-red-600 text-white text-xs rounded-full">
//                         {unreadCount > 9 ? '9+' : unreadCount}
//                     </span>
//                 )}
//             </button>

//             {/* Notifications Dropdown */}
//             {showNotifications && (
//                 <div
//                     id="notifications-dropdown"
//                     className="absolute right-0 mt-2 w-[592px] bg-white shadow-lg rounded-lg p-6"
//                 >
//                     {/* Header */}
//                     <div className="flex justify-between items-center w-full">
//                         <span className="font-semibold text-lg">
//                             Notifications ({unreadCount})
//                         </span>
//                         <button
//                             onClick={markAllAsRead}
//                             className="flex items-center text-sm font-semibold text-[#518672] hover:underline"
//                         >
//                             Mark all as read
//                             <Image
//                                 src="/check_circle.svg"
//                                 alt="Mark as read"
//                                 width={20}
//                                 height={20}
//                                 className="ml-2"
//                             />
//                         </button>
//                     </div>

//                     <div className="w-full bg-[#DEDEDE] h-[1px] mt-4 mb-4" />

//                     {/* Notifications List */}
//                     <div
//                         className={`flex flex-col w-full mt-4 ${notifications.length > 0 ? 'max-h-[300px] overflow-y-scroll' : ''
//                             }`}
//                     >
//                         {notifications.length > 0 ? (
//                             <>
//                                 {notifications.map((notification) => (
//                                     <div
//                                         key={notification.id}
//                                         className={`flex items-start w-full p-4 rounded-lg ${notification.read
//                                             ? 'bg-white text-gray-500'
//                                             : 'bg-white text-black'
//                                             } cursor-pointer hover:bg-[#DCE7E3]`}
//                                         onClick={() => markAsRead(notification.id)}
//                                     >
//                                         <div className="flex items-center w-full">
//                                             {!notification.read && (
//                                                 <div className="w-2 h-2 rounded-full bg-[#518672] mr-4"></div>
//                                             )}
//                                             <div className="flex flex-col">
//                                                 <span className="font-medium">
//                                                     {notification.message}
//                                                 </span>
//                                                 <span className="text-sm text-gray-400 text-left">
//                                                     {notification.time}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                                 {/* Separator and Empty State */}
//                                 <div className="w-full bg-[#DEDEDE] h-[1px] mt-4 mb-4" />
//                                 <NotificationsFeedEmpty />
//                             </>
//                         ) : (
//                             <NotificationsFeedEmpty />
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default NavbarNotifications;

import { SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/utils/students';

interface Notification {
    id: number;
    message: string;
    time: string;
    read: boolean;
}

const NavbarNotifications = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const unreadCount = notifications.filter((n) => !n.read).length;


    // Fetch notifications on component mount
    //   useEffect(() => {
    //     const userId = 1; // Replace with the logged-in user's ID
    //     fetchNotifications(userId)
    //       .then((data: SetStateAction<Notification[]>) => setNotifications(data))
    //       .catch((err: any) => console.error('Error fetching notifications:', err));
    //   }, []);

    // Fetch the user ID from local storage
    useEffect(() => {
        const auth = localStorage.getItem('AUTH');
        if (auth) {
            const authObject = JSON.parse(auth);
            setUserId(Number(authObject.id));
        }
    }, []);

    // Fetch notifications when the component mounts and userId is available
    useEffect(() => {
        if (userId) {
            fetchNotifications(userId)
                .then((data) => setNotifications(data))
                .catch((err) => console.error('Error fetching notifications:', err));
        }
    }, [userId]);

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const markAsRead = (id: number) => {
        markNotificationAsRead(id)
            .then(() => {
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, read: true } : n))
                );
            })
            .catch((err: any) => console.error('Error marking notification as read:', err));
    };

    const markAllAsRead = () => {
        const unreadNotifications = notifications.filter((n) => !n.read);
        const unreadIds = unreadNotifications.map((n) => n.id);

        markAllNotificationsAsRead(unreadIds)
            .then(() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            })
            .catch((err: any) => console.error('Error marking all notifications as read:', err));
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const dropdown = document.getElementById('notifications-dropdown');
            if (
                dropdown &&
                !dropdown.contains(event.target as Node) &&
                !(event.target as HTMLElement).closest('.notification-trigger')
            ) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const NotificationsFeedEmpty = () => {
        const noNotifications = notifications.length === 0;

        return (
            <div className="flex flex-col items-center">
                <Image
                    src="/no-notifications.svg"
                    alt="No Notifications"
                    width={164}
                    height={120}
                    className="mb-6"
                />
                <p className="text-gray-600">
                    {noNotifications
                        ? 'There are no notifications. We will notify you of all the important events in your learning journey.'
                        : 'You have caught up with all the notifications.'}
                </p>
            </div>
        );
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={toggleNotifications}
                className={`p-2 rounded-full hover:bg-gray-200 relative notification-trigger ${showNotifications ? 'border-2 border-[#DCE7E3] bg-[#DCE7E3]' : ''
                    }`}
            >
                <Image
                    src={showNotifications ? '/notifications (1).svg' : '/notifications.svg'}
                    alt="Notifications"
                    width={24}
                    height={24}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center h-4 w-4 bg-red-600 text-white text-xs rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div
                    id="notifications-dropdown"
                    className="absolute right-0 mt-2 w-[592px] bg-white shadow-lg rounded-lg p-6"
                >
                    {/* Header */}
                    <div className="flex justify-between items-center w-full">
                        <span className="font-semibold text-lg">Notifications ({unreadCount})</span>
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center text-sm font-semibold text-[#518672] hover:underline"
                        >
                            Mark all as read
                            <Image
                                src="/check_circle.svg"
                                alt="Mark as read"
                                width={20}
                                height={20}
                                className="ml-2"
                            />
                        </button>
                    </div>

                    <div className="w-full bg-[#DEDEDE] h-[1px] mt-4 mb-4" />

                    {/* Notifications List */}
                    <div
                        className={`flex flex-col w-full mt-4 ${notifications.length > 0 ? 'max-h-[300px] overflow-y-scroll' : ''
                            }`}
                    >
                        {notifications.length > 0 ? (
                            <>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`flex items-start w-full p-4 rounded-lg ${notification.read ? 'bg-white text-gray-500' : 'bg-white text-black'
                                            } cursor-pointer hover:bg-[#DCE7E3]`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex items-center w-full">
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-[#518672] mr-4"></div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium">{notification.message}</span>
                                                <span className="text-sm text-gray-400 text-left">{notification.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Separator and Empty State */}
                                <div className="w-full bg-[#DEDEDE] h-[1px] mt-4 mb-4" />
                                <NotificationsFeedEmpty />
                            </>
                        ) : (
                            <NotificationsFeedEmpty />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavbarNotifications;
