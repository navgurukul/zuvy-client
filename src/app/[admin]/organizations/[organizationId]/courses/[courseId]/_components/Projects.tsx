import Link from 'next/link'
import React from 'react'
import ProjectSubmissionComponent from './ProjectSubmissionComponent'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParams, usePathname } from 'next/navigation'
import { getUser } from '@/store/store'

import { Params } from '@/app/[admin]/organizations/[organizationId]/courses/[courseId]/_components/adminCourseCourseIdComponentType'

const Projects = (params: Params) => {
    const arr = [1, 2, 3, 4, 5, 6]
    const { organizationId } = useParams()
    const { user } = getUser()
    const userRole = user?.rolesList?.[0]?.toLowerCase() || ''
    const isSuperAdmin = userRole === 'super_admin';
    const orgId = isSuperAdmin ? organizationId : user?.orgId 

    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                {arr.map((element, index) => (
                    <Link
                        href={`/${userRole}/organizations/${orgId}/courses/${params.courseID}/submissions/projects/${index}`}
                        key={index}
                    >
                        <ProjectSubmissionComponent />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Projects
