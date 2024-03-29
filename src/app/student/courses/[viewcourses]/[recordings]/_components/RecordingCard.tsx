import { ChevronRight, Clapperboard, Clock3 } from 'lucide-react'
import Moment from 'react-moment'
import Link from 'next/link'

import { toast } from '@/components/ui/use-toast'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import api from '@/utils/axios.config'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ellipsis } from '@/lib/utils'

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
        <Card className="w-full p-6">
            <div className="flex justify-start">
                <Clapperboard size={40} className="text-yellow-dark mr-2" />
                <div>
                    <p className="text-xl text-start">
                        {ellipsis(classData.title, 40)}
                    </p>
                    <div className="text-md flex w-[200px] font-semibold capitalize items-center">
                        <Moment format="hh:mm A">{classData.startTime}</Moment>
                        <p className="mx-2">-</p>
                        <Moment format="hh:mm A">{classData.endTime}</Moment>
                    </div>
                </div>
            </div>
            <div
                onClick={handleViewRecording}
                className="mt-6 gap-3 flex justify-end text-secondary font-bold text-md cursor-pointer"
            >
                <div className="flex items-center">
                    <p className="mr-1 text-lg">View Recording</p>
                    <ChevronRight size={15} />
                </div>
            </div>
        </Card>
    )
}

export default RecordingCard
