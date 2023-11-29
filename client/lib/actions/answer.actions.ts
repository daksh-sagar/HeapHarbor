'use server'

import { connectToDb } from '@/database/db'
import { AnswerVoteParams, CreateAnswerParams, DeleteAnswerParams, GetAnswersParams } from './shared.types'
import { Answer } from '@/database/answer.model'
import { revalidatePath } from 'next/cache'
import { Question } from '@/database/question.model'
import { User } from '@/database/user.model'
import { Interaction } from '@/database/interaction.model'

export async function createAnswer(params: CreateAnswerParams): Promise<void> {
  try {
    await connectToDb()

    const { question, content, author, path } = params

    const answer = await Answer.create({
      question,
      content,
      author,
    })

    const ques = await Question.findByIdAndUpdate(question, { $push: { answers: answer._id } })

    await Interaction.create({
      user: author,
      action: 'answer',
      question,
      answer: answer._id,
      tags: ques?.tags,
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getAnswers(params: GetAnswersParams) {
  try {
    await connectToDb()

    const { questionId, sort, page = 1, pageSize = 10 } = params

    const skipAmount = (page - 1) * pageSize

    let sortOptions = {}

    switch (sort) {
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

    const isNext = totalAnswer > skipAmount + answers.length

    return { answers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDb()

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params

    let updateQuery = {}

    if (hasUpvoted) {
      updateQuery = { $pull: { upvotes: userId } }
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { upvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true })

    if (!answer) {
      throw new Error('Answer not found')
    }

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasUpvoted ? -10 : hasDownvoted ? 20 : 10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  try {
    await connectToDb()

    const { answerId, userId, hasUpvoted, hasDownvoted, path } = params

    let updateQuery = {}

    if (hasDownvoted) {
      updateQuery = { $pull: { downvotes: userId } }
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      }
    } else {
      updateQuery = { $addToSet: { downvotes: userId } }
    }

    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, { new: true })

    if (!answer) {
      throw new Error('Answer not found')
    }

    await User.findByIdAndUpdate(answer.author, {
      $inc: { reputation: hasDownvoted ? 10 : hasUpvoted ? -20 : -10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteAnswer(params: DeleteAnswerParams) {
  try {
    await connectToDb()

    const { answerId, path } = params

    const answer = await Answer.findById(answerId)

    if (!answer) {
      throw new Error('Answer not found')
    }

    await Promise.all([
      Answer.deleteOne({ _id: answerId }),
      Question.updateOne({ _id: answer.question }, { $pull: { answers: answerId } }),
      Interaction.deleteMany({ answer: answerId }),
    ])

    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}
