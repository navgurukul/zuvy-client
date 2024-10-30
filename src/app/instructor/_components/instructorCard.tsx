import React from 'react'
import Link from 'next/link'
import Moment from 'react-moment'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Copy } from 'lucide-react'

type Props = {
    batchName: string
    topicTitle: string
    startTime: string
    endTime: string
    typeClass: string
    classLink: string
    status: string
}

const InstructorCard: React.FC<Props> = ({
    batchName,
    topicTitle,
    startTime,
    endTime,
    typeClass,
    classLink,
    status,
}: Props) => {
    const pathname = usePathname()
    const classRecordings = pathname?.includes('/recording')
    const handleCopyToClipboard = (link: string) => {
        navigator.clipboard
            .writeText(link)
            .then(() => {
                // alert('Link copied to clipboard!') // Optional: Show a confirmation
                toast({
                    title: 'Copied!',
                    description: 'Link copied to clipboard!',
                    className:
                        'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
                })
                // console.log('link', link)
            })
            .catch((err) => {
                console.error('Failed to copy: ', err)
            })
    }
    return (
        <div className="">
            <div className="py-2">
                <div className="rounded-lg border-none p-5 shadow-[0_1px_5px_0_rgba(74,74,74,0.10),0_2px_1px_0_rgba(74,74,74,0.06),0_1px_2px_0_rgba(74,74,74,0.08)]">
                    <div className="flex justify-between items-center">
                        <p className="bg-[#FFC374] rounded-xl w-1/2 p-1 text-sm">
                            {batchName}
                        </p>
                        {status === 'ongoing' && (
                            <Badge variant="yellow" className="mb-3">
                                Ongoing
                            </Badge>
                        )}
                    </div>
                    <div className="px-1 py-4 m-2 flex h-2/3">
                        {classRecordings ? (
                            <Image
                                src="/recording.svg"
                                alt="No classes"
                                width={50}
                                height={50}
                            />
                        ) : (
                            <div className="font-bold text-lg flex flex-col border rounded-md py-3 px-5 text-muted-foreground border-muted-foreground">
                                <Moment format="DD">{startTime}</Moment>
                                <Moment format="MMM">{startTime}</Moment>
                            </div>
                        )}

                        <div className="px-3 flex flex-col gap-y-3 ">
                            <h1 className="font-semibold text-left">
                                {topicTitle}
                            </h1>
                            <div className="text-md flex">
                                <Moment format="hh:mm A">{startTime}</Moment>
                                <p className="mx-2">-</p>
                                <Moment format="hh:mm A">{endTime}</Moment>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
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
    )
}

export default InstructorCard
