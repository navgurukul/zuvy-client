'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'

import { useState } from 'react'
import DropzoneforMcq from './DropzoneforMcq'
import { api } from '@/utils/axios.config'

type Props = {}
const FormSchema = z.object({
    sheeturl: z.string().url(),
})

const BulkUploadMcq = (props: Props) => {
    const [mcqData, setMcqData] = useState(null)

    async function handleSubmit(e: any) {
        e.preventDefault()
        try {
            await api.post(`/Content/quiz`, mcqData)
            toast({
                title: 'Success',
                description: 'Question Created Successfully',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-secondary max-w-sm px-6 py-5 box-border z-50',
            })
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.data?.message || 'An error occurred',
                className:
                    'fixed bottom-4 right-4 text-start capitalize border border-destructive max-w-sm px-6 py-5 box-border z-50',
            })
        }
    }

    return (
        <main className="flex flex-col ml-6 items-start w-full  ">
            <form onSubmit={handleSubmit} className="w-2/3 space-y-6">
                <div className="flex flex-col justify-center  items-center">
                    <DropzoneforMcq
                        mcqSide={true}
                        className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block w-[450px]"
                        setMcqData={setMcqData}
                        mcqData={mcqData}
                    />
                </div>

                <div className="flex justify-end  w-full">
                    <Button className="" type="submit">
                        Add Questions
                    </Button>
                </div>
            </form>
        </main>
    )
}

export default BulkUploadMcq
