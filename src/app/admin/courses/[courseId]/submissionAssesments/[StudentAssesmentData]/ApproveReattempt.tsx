'use client'

import { api } from "@/utils/axios.config"

import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from 'lucide-react';
import { getIsReattemptApproved } from "@/store/store"


const ApproveReattempt = ({ data }: { data: any }) => {

    const [reattemptRequested, setReattemptRequested] = useState(data?.reattemptRequested)
    const [reattemptApproved, setReattemptApproved] = useState(data?.reattemptApproved)
    const {setIsReattemptApproved} = getIsReattemptApproved()

    const [confirmationOpen, setConfirmationOpen] = useState(false)

    async function handleApproveReattempt() {
        try {
           if(reattemptRequested && !reattemptApproved) {
            const res = await api.post(`admin/assessment/approve-reattempt?assessmentSubmissionId=${data?.id}`)
            .then(() => setTimeout(() => {
                setConfirmationOpen(false)
                setReattemptApproved(true)
                setIsReattemptApproved(true)
            }
                , 2000))
            }

        } catch (error) {
            console?.error('Error approving reattempt:', error)
            setTimeout(() => {
                setConfirmationOpen(false)
            }
                , 2000)
        }
    }

    return (
        <>
            <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
                {(!reattemptRequested || reattemptApproved) ? (
                    <div
                            className="w-14 text-secondary font-bold opacity-50 cursor-not-allowed"
                        >
                            Approve Re-attempt
                        </div>
                    ) : (
                        <DialogTrigger asChild>
                        <div
                            className="w-14 text-secondary font-bold cursor-pointer"
                            onClick={handleApproveReattempt}
                        >
                            Approve Re-attempt
                        </div>
                </DialogTrigger>
                    )}
                <DialogOverlay />
                <DialogContent className="w-[30rem] h-[13rem] [&>button]:hidden" onPointerDownOutside={(e) => setConfirmationOpen(false)}>

                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-800 w-full flex items-center justify-center flex-col gap-y-5">
                            <Check size={30} className="bg-[#7CB342] text-white mr-2 " />
                            <p className="mb-5">Re-attempt Request Approved </p>                                               </DialogTitle>
                        <DialogDescription className="text-md text-gray-600 w-full text-center">
                            The assessment has been reset. A confirmation has been sent to the student’s registered email id                                                </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ApproveReattempt