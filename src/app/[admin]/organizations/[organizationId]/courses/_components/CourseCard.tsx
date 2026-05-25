import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Users, Clock, BookOpen } from 'lucide-react'
import { CourseCardProps } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/submissionVideo/submissionVideoIdPageType'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import OptimizedImageWithFallback from '@/components/ImageWithFallback'
import { Badge } from '@/components/ui/badge'

const CourseCard = ({
    course,
    validImageUrl,
    onClick,
    statusOptions,
}: CourseCardProps) => {
    const index = Math.floor(Math.random() * (5 - 1 + 1)) + 1

    return (
        <Card
            className="group cursor-pointer transition-all duration-200 hover:shadow-hover hover:-translate-y-1 bg-card border-border flex flex-col h-full"
            onClick={onClick}
        >
            <CardHeader className="p-0">
                {(
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100 relative">
                        <Image
                            src={validImageUrl || `/zuvy-logo-horizontal.png`}
                            alt={course.name}
                            fill
                            className={validImageUrl ? `h-full w-full object-cover group-hover:scale-105 transition-transform duration-200` : `object-scale-down group-hover:scale-105 transition-transform duration-200` }
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )
                }
            </CardHeader>

            <CardContent className=" p-6 flex-1">
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-semibold font-body text-start text-lg leading-tight line-clamp-2 transition-colors flex-1">
                        {course.name}
                    </h3>
                    
                    {/* Organization Code Badge */}
                    {/* {(course as any).organizationCode && ( */}
                        <div className="flex items-center px-2 bg-primary/10 text-primary rounded-full font-medium border border-primary/20 shrink-0">
                            <span className='text-[14px]'>{course.code}</span>
                        </div>
                    {/* )} */}
                </div>
            </CardContent>

            <CardFooter className="px-6 pb-6 pt-0 mt-auto">
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
                        {course.duration != null && course.duration !== '' && (
                            <span>
                                {course.duration}{' '}
                                {Number(course.duration) <= 1
                                    ? 'week'
                                    : 'weeks'}
                            </span>
                        )}
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}

export default CourseCard
