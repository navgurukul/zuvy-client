import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import React from 'react'

type Props = {}

const ProjectSubmissionComponent = (props: Props) => {
    return (
        <div className="lg:flex h-[120px] w-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-md p-4">
            <div className="flex flex-col w-full ">
                <h1 className="font-semibold text-start">Build a Calculator</h1>
                <div className="flex items-center gap-2">
                    <div className="bg-yellow h-2 w-2 rounded-full" />
                    <p className="text-start">20/50 Submission</p>
                </div>
            </div>
            <div className="flex items-end ">
                <Button variant={'ghost'} className="text-secondary text-md">
                    View Submission{' '}
                    <ChevronRight className="text-secondary" size={17} />
                </Button>
            </div>
        </div>
    )
}

export default ProjectSubmissionComponent
