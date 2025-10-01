import {
    BarChart,
    Layout,
    List,
    LogOut,
    Layers,
    Settings,
    Code,
    Home,
    Book,
    BookOpen,
    Video,
    MonitorPlay,
    Database,
} from 'lucide-react'

// const guestRoutes = [
//     {
//         icon: Layout,
//         label: 'Dashboard',
//         href: '/student',
//         subtabs: [],
//     },
//     {
//         icon: BookOpen,
//         label: 'My Courses',
//         href: '/student/courses',
//         subtabs: [],
//     },
//     {
//         icon: MonitorPlay,
//         label: 'Class Recordings',
//         href: '/student/recordings',
//         subtabs: [],
//     },
//     // {
//     //     icon: Code,
//     //     label: 'Coding Playground',
//     //     href: '/student/playground',
//     //     subtabs: [],
//     // },
//     // {
//     //   icon: Compass,
//     //   label: "Explore",
//     //   href: "/student/explore",
//     // },
//     // {
//     //   icon: Code,
//     //   label: "Playground",
//     //   href: "/student/playground",
//     // },
//     // {
//     //   icon: MessagesSquare,
//     //   label: "Discussion",
//     //   href: "/student/discussion",
//     // },
//     // {
//     //   icon: MessageCircleQuestion,
//     //   label: "Help",
//     //   href: "/student/help",
//     // },
// ]

const guestRoutes = [
    {
        name: 'Dashboard',
        href: '/student',
        icon: Layout,
        active: '/student',
    },
    {
        name: 'My Courses',
        href: '/student/courses',
        icon: BookOpen,
        active: '/student/courses',
    },
    {
        name: 'Class Recordings',
        href: '/student/recordings',
        icon: MonitorPlay,
        active: '/student/recordings',
    },
]

// const teacherRoutes = [
//     {
//         icon: List,
//         label: 'Classes',
//         href: '/instructor',
//         subtabs: [],
//     },
//     {
//         icon: BookOpen,
//         label: 'Courses',
//         href: '/instructor/courses',
//         subtabs: [],
//     },
//     {
//         icon: Video,
//         label: 'Recording',
//         href: '/instructor/recording',
//         subtabs: [],
//     },
//     // {
//     //     icon: BookOpen,
//     //     label: 'Curricullum',
//     //     href: '/instructor/curricullum',
//     //     subtabs: [],
//     // },
//     // {
//     //     icon: BarChart,
//     //     label: 'Analytics',
//     //     href: '/instructor/analytics',
//     //     subtabs: [],
//     // },
// ]

const teacherRoutes = [
    {
        name: 'Classes',
        href: '/instructor',
        icon: List,
        active: '/instructor',
    },
    {
        name: 'Courses',
        href: '/instructor/courses',
        icon: BookOpen,
        active: '/instructor/courses',
    },
    {
        name: 'Recording',
        href: '/instructor/recording',
        icon: Video,
        active: '/instructor/recording',
    },
]

// const adminRoutes = [
//     // { label: 'Home', icon: Home, href: '/admin', subtabs: [] },
//     { label: 'Courses', icon: Book, href: '/admin/courses', subtabs: [] },
//     {
//         label: 'Resource Library',
//         icon: Database,
//         href: '',
//         subtabs: [
//             {
//                 label: 'Coding Problems',
//                 href: '/admin/resource/coding',
//                 icon: Video,
//             },
//             { label: 'MCQs', href: '/admin/resource/mcq', icon: Video },
//             {
//                 label: 'Open-Ended Questions',
//                 href: '/admin/resource/open-ended',
//                 icon: Video,
//             },
//         ],
//     },
//     // { label: "Instructors", icon: Book, href: "/admin/instructor" },
//     // { label: "Reports", icon: BarChart, href: "/admin/reports" },
//     // { label: "Settings", icon: Cog, href: "/admin/settings" },
//     // { label: "Help", icon: HelpCircle, href: "/admin/help" },
// ]

const adminRoutes = [
    {
        name: 'Course Studio',
        href: '/admin/courses',
        icon: Layers,
        active: (pathname: string) => 
        pathname === '/admin/courses' || pathname.startsWith('/admin/courses/'),
    },
    {
        name: 'Question Bank',
        href: '/admin/content-bank',
        icon: Database,
        active: '/admin/content-bank',
    },
    {
        name: 'Roles and Permissions',
        href: '/admin/settings',
        icon: Settings,
        active: '/admin/settings',
    },
]

const commonRoutes = [
    {
        icon: LogOut,
        label: 'Logout',
        href: '/',
        subtabs: [],
    },
]

export { guestRoutes, teacherRoutes, commonRoutes, adminRoutes }
