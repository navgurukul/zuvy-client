import React from 'react'
import { ChevronRight, Edit, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogTrigger } from '@radix-ui/react-alert-dialog'
import {
    AlertDialogAction,
    AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'

function ClassCardSkeleton() {
    return (
        <Card className="w-full mb-6 border-none p-5 shadow-[0px_1px_5px_2px_#4A4A4A14,0px_2px_1px_1px_#4A4A4A0A,0px_1px_2px_1px_#4A4A4A0F] relative">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                    <Skeleton className="h-[90px] w-[90px] rounded-xl" />
                    <div>
                        <h3 className="font-semibold">
                            <Skeleton className="h-[10px] w-[200px] rounded-xl" />
                        </h3>
                        <div className="flex gap-4 mt-2">
                            <Skeleton className="h-[10px] w-[90px] rounded-xl" />
                            <Skeleton className="h-[10px] w-[90px] rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ClassCardSkeleton
