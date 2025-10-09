import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, BookOpen } from 'lucide-react'
import {
    Course,
    CourseData,
    CoursesResponse,
    CourseCardProps,
} from '@/app/[admin]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const CourseCard = ({
    course,
    validImageUrl,
    onClick,
    statusOptions,
}: CourseCardProps) => {
    const index = Math.floor(Math.random() * (5 - 1 + 1)) + 1
    const status = statusOptions[index].value
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'bg-green-50 text-green-700 border-green-200'
            case 'ongoing':
                return 'bg-orange-50 text-orange-700 border-orange-200'
            case 'completed':
                return 'bg-blue-50 text-blue-700 border-blue-200'
            case 'draft':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'archived':
                return 'bg-gray-50 text-gray-600 border-gray-200'
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200'
        }
    }

    return (
        <Card
            className="group w-[400px] cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white border border-gray-200 flex flex-col h-full"
            onClick={onClick}
        >
            <CardHeader className="p-0">
                {validImageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 relative">
                        <Image
                            src={validImageUrl}
                            alt={course.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                ) : (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-100 to-blue-500 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-blue-600 opacity-60" />
                    </div>
                    // <div className="bg-muted flex justify-center h-[200px] relative overflow-hidden rounded-sm">
                    //     <OptimizedImageWithFallback
                    //         src={
                    //             ''
                    //         }
                    //         alt={
                    //             course.name ||
                    //             'Course Image'
                    //         }
                    //         fallBackSrc="/logo_white.png"
                    //     />
                    // </div>
                )}
            </CardHeader>

            <CardContent className="bg-muted p-6 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold text-start text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                        {course.name}
                    </h3>
                    {/* <Badge 
            variant="outline" 
            className={cn("capitalize text-xs", getStatusColor(status))}
          >
            {status}
            {course.status}
          </Badge> */}
                </div>
            </CardContent>

            <CardFooter className="bg-muted px-6 pb-6 pt-0 mt-auto">
                <div className="flex items-center justify-between w-full text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                            {' '}
                            {course.students_in_bootcamp ??
                                course.learnersCount ??
                                0}{' '}
                            Learners
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                            {course.duration} {Number(course.duration) <= 1 ? 'week' : 'weeks'}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

export default CourseCard
