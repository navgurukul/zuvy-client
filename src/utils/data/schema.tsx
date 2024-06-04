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
    status: z.string(),
    noOfAttempts: z.number(),
})

export const testCaseSchema = z.object({
    input: z.array(z.number()),
    output: z.array(z.number()),
})

export const codingQuestionSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    difficulty: z.string(),
    tags: z.number(),
    constraints: z.string(),
    authorId: z.number(),
    inputBase64: z.null().optional(),
    examples: z.array(testCaseSchema),
    testCases: z.array(testCaseSchema),
    expectedOutput: z.array(z.number()),
    solution: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type CodingQuestion = z.infer<typeof codingQuestionSchema>

export type Task = z.infer<typeof taskSchema>

export type OpenEndedQuestion = z.infer<typeof openEndedQuestionSchema>

export const openEndedQuestionSchema = z.object({
    id: z.number(),
    question: z.string(),
    difficulty: z.string(),
    tagId: z.number(),
    marks: z.string().transform((val) => parseInt(val, 10)),
    usage: z.number(),
})
