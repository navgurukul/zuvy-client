import Link from 'next/link'
import React from 'react'
import ProjectSubmissionComponent from './ProjectSubmissionComponent'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {}

const Projects = (params: any) => {
    console.log(params.courseId)
    const arr = [1, 2, 3, 4, 5, 6]
    return (
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 mt-4 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
                {arr.map((element, index) => (
                    <Link
                        href={`/admin/courses/${params.courseId}/submissions/projects/${index}`}
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
