import React from 'react'
import Link from 'next/link'
import Moment from 'react-moment'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

import { Copy } from 'lucide-react'

type Props = {
    batchName: string
    topicTitle: string
    startTime: string
    endTime: string
    typeClass: string
    classLink: string
}

const InstructorCard: React.FC<Props> = ({
    batchName,
    topicTitle,
    startTime,
    endTime,
    typeClass,
    classLink,
}: Props) => {
    const handleCopyToClipboard = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                // alert('Link copied to clipboard!') // Optional: Show a confirmation
                toast({
                    title: 'Copied!',
                    description: 'Link copied to clipboard!',
                    className: 'text-start capitalize border border-secondary',
                })
                console.log('link', link)
            })
            .catch((err) => {
                console.error('Failed to copy: ', err)
            })
    }
    return (
        <div className="">
            <div className="py-2">
                {/* <div className="rounded-lg border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F]"> */}
                <div className="rounded-lg border-none p-5 shadow-[0_1px_5px_0_rgba(74,74,74,0.10),0_2px_1px_0_rgba(74,74,74,0.06),0_1px_2px_0_rgba(74,74,74,0.08)]">
                    {/* <div className="rounded-lg border-none p-5 shadow-[0_1px_5px_0_#4A4A4A14,0_2px_1px_0_#4A4A4A0A,0_1px_2px_0_#4A4A4A0F]"> */}
                    <p className="bg-[#FFC374] rounded-xl w-1/2 p-1 text-sm">
                        {batchName}
                    </p>
                    <div className="px-1 py-4 m-2 flex h-2/3">
                        <div className="font-bold text-lg flex flex-col border rounded-md py-3 px-5 text-muted-foreground border-muted-foreground">
                            <Moment format="DD">{startTime}</Moment>
                            <Moment format="MMM">{startTime}</Moment>
                        </div>
                        <div className="px-3 flex flex-col gap-y-3 ">
                            <h1 className="font-semibold">{topicTitle}</h1>
                            {/* <h1 className="">{classesTiming}</h1> */}
                            <div className="text-md flex">
                                <Moment format="hh:mm A">{startTime}</Moment>
                                <p className="mx-2">-</p>
                                <Moment format="hh:mm A">{endTime}</Moment>
                            </div>
                            <div className="flex">
                                <Link
                                    className="font-bold flex items-center text-secondary"
                                    href={classLink}
                                >
                                    {typeClass === 'upcoming'
                                        ? 'Class Link'
                                        : 'Join Meeting'}
                                </Link>
                                <Button
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.preventDefault() // Prevent navigation
                                        handleCopyToClipboard(classLink)
                                    }}
                                >
                                    <Copy size={15} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InstructorCard
