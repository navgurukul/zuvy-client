import { ChevronRight, Clock3 } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

function StartAssignmentButton({
    classData,
    // status,
    // view,
    buttonClass,
    variant,
}: {
    classData: any
    // status: any
    // view: any
    buttonClass: any
    variant: any
}) {
    return (
        <Button variant={variant} className={buttonClass}>
            <Link
                href={`/student/courses/${classData.bootcampId}/modules/${classData.moduleId}`}
                className="gap-3 flex  items-center text-secondary"
            >
                <p>Start Assignment</p>
                <ChevronRight size={15} />
            </Link>
        </Button>
    )
}

export default StartAssignmentButton
