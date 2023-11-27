import * as z from 'zod'

export const questionFormSchema = z.object({
  title: z.string().min(5).max(130),
  explanation: z.string().min(100),
  tags: z.array(z.string().min(1).max(15)).min(1).max(5),
})

export const answerFormSchema = z.object({
  answer: z.string().min(50).max(100000),
})

export const ProfileSchema = z.object({
  name: z.string().min(5).max(50),
  username: z.string().min(5).max(50),
  bio: z.string().min(10).max(500).optional(),
  portfolioWebsite: z.string().url().optional(),
  location: z.string().min(5).max(50).optional(),
})
