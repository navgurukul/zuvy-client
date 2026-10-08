import { z } from 'zod'

// Shared limits for user-facing names and email addresses.
export const MAX_NAME_LENGTH = 100
export const MAX_EMAIL_LENGTH = 254

export const requiredNameSchema = z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(MAX_NAME_LENGTH, `Name cannot exceed ${MAX_NAME_LENGTH} characters`)

export const requiredEmailSchema = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(MAX_EMAIL_LENGTH, `Email cannot exceed ${MAX_EMAIL_LENGTH} characters`)
    .email('Please enter a valid email address')

export const requiredNameEmailSchema = z.object({
    name: requiredNameSchema,
    email: requiredEmailSchema,
})
