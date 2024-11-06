import React, { useEffect } from 'react'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useGetMCQs from '@/hooks/useGetMCQs'
import { getCodingQuestionTags } from '@/store/store'

type Props = {
    quizQuestionId: number
}

const PreviewMCQ = ({ quizQuestionId }: Props) => {
    const { quizData, difficulty, tagName } = useGetMCQs({ id: quizQuestionId })

    return (
        <DialogHeader>
            <DialogTitle>
                Question Preview <span className="text-[12px]">{tagName}</span>
            </DialogTitle>
            <DialogDescription>
                Make changes to your profile here. Click save when youre done.
            </DialogDescription>
        </DialogHeader>
    )
}

export default PreviewMCQ
