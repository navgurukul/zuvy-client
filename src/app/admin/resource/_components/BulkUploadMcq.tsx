'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { boolean, z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import AddStudentsModal from '../../courses/[courseId]/_components/addStudentsmodal'
import Dropzone from '../../courses/[courseId]/_components/dropzone'

type Props = {}
const FormSchema = z.object({
    sheeturl: z.string().url(),
})

const BulkUploadMcq = (props: Props) => {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            sheeturl: '',
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast({
            title: 'You submitted the following values:',
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">
                        {JSON.stringify(data, null, 2)}
                    </code>
                </pre>
            ),
        })
    }

    return (
        <main className="flex flex-col  items-center w-screen ">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-2/3 space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="sheeturl"
                        render={({ field }) => (
                            <FormItem className="flex flex-col justify-center  items-center">
                                <FormLabel className="w-[450px] text-left">
                                    Google Sheets URL
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Google Sheet URL"
                                        {...field}
                                        className="w-[450px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <h1>or</h1>
                    <div className="flex flex-col justify-center  items-center">
                        <Dropzone
                            studentData={[]}
                            setStudentData={() => {}}
                            mcqSide={true}
                            className="px-5 py-2 mt-10 border-dashed border-2 rounded-[10px] block w-[450px]"
                        />
                    </div>

                    <div className="flex items-end justify-end w-[860px]">
                        <Button className="" type="submit">
                            Add Questions
                        </Button>
                    </div>
                </form>
            </Form>
        </main>
    )
}

export default BulkUploadMcq
