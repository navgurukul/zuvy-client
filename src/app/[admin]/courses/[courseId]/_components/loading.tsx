// app/[admin]/courses/[courseId]/details/loading.tsx
import {GeneralDetailsSkeleton } from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'
import {CourseLayoutSkeleton} from '@/app/[admin]/courses/[courseId]/_components/adminSkeleton'

export default function Loading() {
  return (
    <>
      <GeneralDetailsSkeleton />
      <CourseLayoutSkeleton />
    </>
  )
}
