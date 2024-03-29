import { ChevronRight, Clock3 } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

import { toast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'

function RecordingCard({
    classData,
    classType,
}: {
    classData: any
    classType: any
}) {
    // misc
    const isVideo = classData.s3link

    // func
    const handleViewRecording = () => {
        if (isVideo) {
            window.open(classData.s3link, '_blank')
        } else {
            toast({
                title: 'Recording not yet updated',
                variant: 'default',
                className: 'text-start capitalize',
            })
        }
    }

    return (
        <Card className="w-full p-6" key={classData.id}>
            <div className="font-semibold">asdjhadfskljhf</div>

            <div
                onClick={handleViewRecording}
                className=" gap-3 items-center text-secondary cursor-pointer"
            >
                <div className="flex items-center">
                    <p className="mr-1">View Recording</p>
                    <ChevronRight size={15} />
                </div>
            </div>
        </Card>
    )
}

export default RecordingCard
