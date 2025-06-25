'use client'

import StudentNavbar from '@/app/_components/navbar'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { useParams, usePathname, useRouter } from 'next/navigation'
import UnauthorizedUser from '@/components/UnauthorizedUser'
import { getModuleDataNew, getUser } from '@/store/store'
import { Spinner } from '@/components/ui/spinner'
import '../globals.css'
import useWindowSize from '@/hooks/useHeightWidth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    BookOpenText,
    SquareCode,
    FileQuestion,
    PencilLine,
    StickyNote,
    Video,
    BookOpenCheck,
    CheckCircle,
    X,
} from 'lucide-react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Check, Menu } from 'lucide-react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ellipsis } from '@/lib/utils'
import { api } from '@/utils/axios.config'
import { toast } from '@/components/ui/use-toast'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Get the current path
    const router = useRouter()

    const pathname = usePathname()
    const { width } = useWindowSize()
    const { moduleData } = getModuleDataNew()
    const [open, setOpen] = useState(false)
    const segments = pathname.split('/')
    const [studentData, setStudentData] = useState([])
    const [isEnrolled, setIsEnrolled] = useState(false)

    let couseId = segments[3]
    let moduleId = segments[5]
    let chapterId = segments[7]

    const isMobile = width < 768

    const isAssessmentRoute =
        pathname?.includes('/student/courses') &&
        pathname?.includes('/modules') &&
        pathname?.includes('/assessment')
    const isCourseRoute =
        pathname?.includes('/student/courses') && pathname?.includes('/batch')

    const isChapterPage =
        pathname?.includes('/student/courses') &&
        pathname?.includes('/modules/') &&
        pathname?.includes('/chapters/')
    const { user, setUser } = getUser()
    const rolesList = user && user.rolesList.length > 0 && user.rolesList[0]

    const isChapterRoute =
        /\/(chapters|viewresults|quizresults|codingresults|openendedresults|assessment)/.test(
            pathname
        )

    const setTopicIcon = (topicId: any) => {
        switch (topicId) {
            case 1:
                return <Video className="" />
            case 2:
                return <BookOpenText />
            case 3:
                return <SquareCode />
            case 4:
                return <FileQuestion />
            case 5:
                return <PencilLine />
            case 6:
                return <BookOpenCheck />
            default:
                return <StickyNote />
        }
    }
    const activeChapter: any = moduleData?.moduleName.find(
        (chapter: any) => chapter?.id == chapterId
    )
    const currentIndex = moduleData?.moduleName.findIndex(
        (chapter: any) => chapter?.id === activeChapter?.id
    )

    const prevChapter: any =
        currentIndex > 0 ? moduleData.moduleName[currentIndex - 1] : null
    const nextChapter: any =
        currentIndex < moduleData.moduleName.length - 1
            ? moduleData.moduleName[currentIndex + 1]
            : null

    const goToChapter = (chapterId: any) => {
        router.push(
            `/student/courses/${couseId}/modules/${moduleId}/chapters/${chapterId}`
        )
    }
    const getMarginTop = (width: number) => {
        if (width <= 390) return 'mt-[29rem]'
        if (width <= 412) return 'mt-[33rem]'
        if (width <= 414) return 'mt-[32rem]'
        if (width <= 430) return 'mt-[34rem]'
        return 'mt-[24rem]'
    }

    useEffect(() => {
        async function getStudentsData() {
            const res = await api.get('/student')
            setStudentData(res.data.inProgressBootcamps)
        }
        getStudentsData()
    }, [])

    if (studentData?.length === 0) return

    // const isCourseEnrolled = studentData.some(
    //     (courses: any) => courses.id == couseId
    // )

    // if (isChapterPage || isChapterRoute) {
    //     if (!isCourseEnrolled) {
    //         toast.error({
    //             title: 'Failed',
    //             description: 'You were not enrolled in thar course.'
    //         })
    //         router.push('/student/courses')
    //     }
    // }

    return (
        <div className="h-screen ">
            {user.email.length == 0 ? (
                <div className="flex items-center justify-center h-[680px]">
                    <Spinner className="text-secondary" />
                </div>
            ) : user.rolesList.length === 0 ||
              (user.rolesList.length > 0 && user.rolesList[0] !== 'student') ? (
                <UnauthorizedUser rolesList={rolesList} path={'Student'} />
            ) : (
                <div className={`h-screen ${isMobile ? '' : ''} `}>
                    <div>{!isAssessmentRoute && <StudentNavbar />}</div>
                    <div
                        className={` ${
                            isChapterRoute ? 'px-0 md:px-2 lg:px-2' : 'pt-20'
                        } `}
                    >
                        <div className="relative">
                            {children}
                            <div className="absolute bottom-0 w-full left-0 bg-[#DCE7E3]">
                                {isMobile && isChapterPage && (
                                    <div className=" ">
                                        <Popover
                                            open={open}
                                            onOpenChange={setOpen}
                                        >
                                            {!open && (
                                                <div
                                                    className={`flex justify-between p-4 `}
                                                >
                                                    <Button
                                                        onClick={() =>
                                                            prevChapter &&
                                                            goToChapter(
                                                                prevChapter.id
                                                            )
                                                        }
                                                        className="text-secondary"
                                                        disabled={!prevChapter}
                                                        variant={'ghost'}
                                                    >
                                                        Back
                                                    </Button>
                                                    <PopoverTrigger asChild>
                                                        <div className="flex">
                                                            <Button
                                                                variant={
                                                                    'ghost'
                                                                }
                                                                className="bg-[#DCE7E3] "
                                                            >
                                                                <div className="text-secondary flex items-center rounded-md gap-2 text-md ">
                                                                    <Menu />{' '}
                                                                    Chapter{' '}
                                                                    <span className="">
                                                                        {currentIndex +
                                                                            1}
                                                                    </span>
                                                                    of{' '}
                                                                    {
                                                                        moduleData
                                                                            .moduleName
                                                                            .length
                                                                    }
                                                                </div>
                                                            </Button>
                                                        </div>
                                                    </PopoverTrigger>
                                                    <Button
                                                        onClick={() =>
                                                            nextChapter &&
                                                            goToChapter(
                                                                nextChapter.id
                                                            )
                                                        }
                                                        className="text-secondary"
                                                        disabled={!nextChapter}
                                                        variant={'ghost'}
                                                    >
                                                        Next
                                                    </Button>
                                                </div>
                                            )}
                                            <PopoverContent
                                                side="top"
                                                className={`w-screen ${
                                                    open
                                                        ? getMarginTop(width)
                                                        : ''
                                                }`}
                                            >
                                                <Label className="flex justify-between font-bold text-[1rem] px-4 py-2 ">
                                                    Module Chapters
                                                    <X
                                                        onClick={() =>
                                                            setOpen(false)
                                                        }
                                                    />
                                                </Label>
                                                <ScrollArea className="h-full w-full">
                                                    <div className="w-full h-52">
                                                        {moduleData.moduleName.map(
                                                            (
                                                                chapter: any,
                                                                index
                                                            ) => {
                                                                let status =
                                                                    chapter.status

                                                                return (
                                                                    <div
                                                                        key={
                                                                            chapter
                                                                        }
                                                                        className={`flex h-12 rounded-md w-full py-2 justify-between ${
                                                                            chapterId ==
                                                                            chapter.id
                                                                                ? 'bg-[#DCE7E3]'
                                                                                : ''
                                                                        }  `}
                                                                    >
                                                                        <div className="flex gap-2 text-[14px] px-4 py-1  ">
                                                                            {setTopicIcon(
                                                                                chapter.topicId
                                                                            )}
                                                                            <Link
                                                                                href={`/student/courses/${couseId}/modules/${moduleId}/chapters/${chapter.id}`}
                                                                            >
                                                                                {
                                                                                    chapter.title
                                                                                }
                                                                            </Link>
                                                                        </div>
                                                                        <span>
                                                                            {status ===
                                                                            'Completed' ? (
                                                                                <div className="px-4 py-1">
                                                                                    <CheckCircle className="  rounded-full " />
                                                                                </div>
                                                                            ) : (
                                                                                ''
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            }
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
