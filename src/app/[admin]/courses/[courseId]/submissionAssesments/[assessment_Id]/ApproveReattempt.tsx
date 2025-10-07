'use client'

import { useState } from 'react'
import { api } from '@/utils/axios.config'
import {
    Dialog,
    DialogOverlay,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Check } from 'lucide-react'
import { getIsReattemptApproved } from '@/store/store'
import { ReattemptData } from '@/app/[admin]/courses/[courseId]/submissionAssesments/[assessment_Id]/IndividualReport/individualReportApproveType'
const ApproveReattempt = ({ data }: { data: ReattemptData }) => {
    const [reattemptRequested, setReattemptRequested] = useState(
        data?.reattemptRequested
    )
    const [reattemptApproved, setReattemptApproved] = useState(
        data?.reattemptApproved
    )
    const { setIsReattemptApproved } = getIsReattemptApproved()

    const [confirmationOpen, setConfirmationOpen] = useState(false)
    const [apiSuccess, setApiSuccess] = useState<boolean | null>(null)
    const [buttonDisabled, setButtonDisabled] = useState(false)

    async function handleApproveReattempt() {
        try {
            if (reattemptRequested && !reattemptApproved) {
                setButtonDisabled(true)
                const res = await api.post(
                    `admin/assessment/approve-reattempt?assessmentSubmissionId=${data?.id}`
                )

                setReattemptApproved(true)

                setTimeout(() => {
                    setIsReattemptApproved(true)
                }, 2000)

                setApiSuccess(true)
            }
        } catch (error) {
            console.error('Error approving reattempt:', error)
            setApiSuccess(false)
        } finally {
            setConfirmationOpen(true)
            setTimeout(() => {
                setConfirmationOpen(false)
                setButtonDisabled(false)
            }, 2000)
        }
    }

    return (
        <>
            {/* Approve Re-attempt Button (outside Dialog) */}
            {!reattemptRequested || reattemptApproved ? (
                <div className="w-14 text-[rgb(81,134,114)] font-bold opacity-50 cursor-not-allowed">
                    Approve Re-attempt
                </div>
            ) : (
                <div
                    className={`w-14 text-[rgb(81,134,114)] font-bold ${
                        buttonDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                    }`}
                    onClick={
                        !buttonDisabled ? handleApproveReattempt : undefined
                    }
                >
                    Approve Re-attempt
                </div>
            )}

            {/* Dialog for confirmation feedback */}
            <Dialog open={confirmationOpen}>
                <DialogOverlay />

                <DialogContent
                    className="w-[26rem] p-6 rounded-2xl shadow-xl"
                    onPointerDownOutside={() => setConfirmationOpen(false)}
                >
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-lg font-bold text-gray-800 flex flex-col items-center text-center">
                            {apiSuccess === true ? (
                                <>
                                    <Check
                                        size={30}
                                        className="bg-[#7CB342] text-white rounded-full p-1"
                                    />
                                    <p className="mt-4">
                                        Re-attempt Request Approved
                                    </p>
                                </>
                            ) : (
                                <p className="text-red-500">
                                    Failed to Approve Re-attempt
                                </p>
                            )}
                        </DialogTitle>

                        <DialogDescription className="text-sm text-gray-600 text-center">
                            {apiSuccess === true
                                ? 'The assessment has been reset. A confirmation has been sent to the student’s registered email ID.'
                                : 'Something went wrong while approving the re-attempt. Please try again.'}
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ApproveReattempt
