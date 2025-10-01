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
    lastActive: z.string().nullable().optional(), // Add this for last active date
    studentStatus: z.enum(['active', 'dropout', 'graduate']).optional(), // Add this for student status
    enrolledDate: z.string().nullable().optional(), // Add this for enrolled date
    reattemptCount: z.number().optional(),
    isChecked: z.boolean(),
    userEmail: z.string(),
    projectId: z.number(),
    id: z.number(),
    userName: z.string(),
    newId: z.number(),
    moduleId: z.number(),
    chapterId: z.number(),
    emailId: z.string(),
    isPassed: z.boolean(),
    percentage: z.number(),
    questionId: z.number(),
    startedAt: z.string(),
    submitedAt: z.string(),
    completedAt: z.string(),
    assessment_Id: z.string(),
    title: z.string().optional(),
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
    usage: z.number(),
    tagId: z.string(),
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
