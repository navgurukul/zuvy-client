import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
    email: z.string(),
    name: z.string(),
    userId: z.number(),
    batchId: z.number(),
    bootcampId: z.number(),
    profilePicture: z.string().nullable(),
    progress: z.number(),
    batchName: z.string(),
    attendance: z.number(),
})

export type Task = z.infer<typeof taskSchema>
