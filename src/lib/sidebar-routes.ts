import {
    BarChart,
    Layout,
    List,
    LogOut,
    Code,
    Home,
    Book,
    BookOpen,
    Video,
    MonitorPlay,
    Database,
} from 'lucide-react'

const guestRoutes = [
    {
        icon: Layout,
        label: 'Dashboard',
        href: '/student',
        subtabs: [],
    },
    {
        icon: BookOpen,
        label: 'My Courses',
        href: '/student/courses',
        subtabs: [],
    },
    {
        icon: MonitorPlay,
        label: 'Class Recordings',
        href: '/student/recordings',
        subtabs: [],
    },
    {
        icon: Code,
        label: 'Coding Playground',
        href: '/student/playground',
        subtabs: [],
    },
    // {
    //   icon: Compass,
    //   label: "Explore",
    //   href: "/student/explore",
    // },
    // {
    //   icon: Code,
    //   label: "Playground",
    //   href: "/student/playground",
    // },
    // {
    //   icon: MessagesSquare,
    //   label: "Discussion",
    //   href: "/student/discussion",
    // },
    // {
    //   icon: MessageCircleQuestion,
    //   label: "Help",
    //   href: "/student/help",
    // },
]

const teacherRoutes = [
    {
        icon: List,
        label: 'Courses',
        href: '/instructor/courses',
        subtabs: [],
    },
    {
        icon: Video,
        label: 'Recording',
        href: '/instructor/recording',
        subtabs: [],
    },
    {
        icon: BookOpen,
        label: 'Curricullum',
        href: '/instructor/curricullum',
        subtabs: [],
    },
    {
        icon: BarChart,
        label: 'Analytics',
        href: '/instructor/analytics',
        subtabs: [],
    },
]

const adminRoutes = [
    { label: 'Home', icon: Home, href: '/admin', subtabs: [] },
    { label: 'Courses', icon: Book, href: '/admin/courses', subtabs: [] },
    {
        label: 'Resource Library',
        icon: Database,
        href: '',
        subtabs: [
            {
                label: 'Coding Problems',
                href: '/admin/resource/coding',
                icon: Video,
            },
            { label: 'MCQs', href: '/admin/resource/mcq', icon: Video },
            {
                label: 'Open-Ended Questions',
                href: '/admin/resource/open-ended',
                icon: Video,
            },
        ],
    },
    // { label: "Instructors", icon: Book, href: "/admin/instructor" },
    // { label: "Reports", icon: BarChart, href: "/admin/reports" },
    // { label: "Settings", icon: Cog, href: "/admin/settings" },
    // { label: "Help", icon: HelpCircle, href: "/admin/help" },
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
