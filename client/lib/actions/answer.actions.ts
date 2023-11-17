'use server'

import { connectToDb } from '@/database/db'
import { CreateAnswerParams, GetAnswersParams } from './shared.types'
import { Answer } from '@/database/answer.model'
import { revalidatePath } from 'next/cache'
import { Question } from '@/database/question.model'

export async function createAnswer(params: CreateAnswerParams): Promise<void> {
  try {
    await connectToDb()

    const { question, content, author, path } = params

    const answer = await Answer.create({
      question,
      content,
      author,
    })

    await Question.findByIdAndUpdate(question, { $push: { answers: answer._id } })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDb()

    const { questionId, sortBy, page = 1, pageSize = 10 } = params

    const skipAmount = (page - 1) * pageSize

    let sortOptions = {}

    switch (sortBy) {
      case 'highestUpvotes':
        sortOptions = { upvotes: -1 }
        break
      case 'lowestUpvotes':
        sortOptions = { upvotes: 1 }
        break
      case 'recent':
        sortOptions = { createdAt: -1 }
        break
      case 'old':
        sortOptions = { createdAt: 1 }
        break

      default:
        sortOptions = { upvotes: -1 }
        break
    }

    const answers = await Answer.find({ question: questionId })
      .populate('author', '_id clerkId name picture')
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)

    const totalAnswer = await Answer.countDocuments({
      question: questionId,
    })

    const isNextAnswer = totalAnswer > skipAmount + answers.length

    return { answers, isNextAnswer }
  } catch (error) {
    console.log(error)
    throw error
  }
}
