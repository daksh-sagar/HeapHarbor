'use server'

import { connectToDb } from '@/database/db'
import { Question } from '@/database/question.model'
import { Tag } from '@/database/tag.model'
import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongoose'
import { CreateQuestionParams, GetQuestionByIdParams, GetQuestionsParams, QuestionVoteParams } from './shared.types'
import { User } from '@/database/user.model'

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDb()

    const questions = await Question.find()
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .sort({ createdAt: -1 })

    return { questions }
  } catch (error) {
    console.log(error)
  }
}

export async function createQuestion(params: CreateQuestionParams): Promise<void> {
  try {
    await connectToDb()

    const { title, content, tags, author, path } = params

    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    })

    const tagPromises: Array<Promise<ObjectId>> = tags.map(async tag => {
      // Create the tag or get it if it already exists
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, 'i') } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true },
      )

      return existingTag._id
    })

    const tagDocuments = await Promise.all(tagPromises)

    const promises = [
      Question.findByIdAndUpdate(question._id, {
        $push: { tags: { $each: tagDocuments } },
      }),
      // Interaction.create({
      //   user: author,
      //   action: 'ask_question',
      //   question: question._id,
      //   tags: tagDocuments,
      // }),
      // User.findByIdAndUpdate(author, { $inc: { reputation: 5 } }),
    ]

    await Promise.all(promises)

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDb()
    const { questionId } = params

    const question = await Question.findById(questionId)
      .populate({ path: 'tags', model: Tag, select: '_id name' })
      .populate({ path: 'author', model: User, select: '_id name clerkId picture' })

    return question
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function upvoteQuestion(params: QuestionVoteParams): Promise<void> {
  try {
    await connectToDb()

    const { questionId, userId, hasUpvoted, hasDownvoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true })

    if (!question) {
      throw new Error('Question not found')
    }

    // Increment author's reputation by +10/-10 for recieving an upvote/downvote to the question
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasDownvoted ? -10 : 10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    await connectToDb()

    const { questionId, userId, hasUpvoted, hasDownvoted, path } = params

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

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, { new: true })

    if (!question) {
      throw new Error('Question not found')
    }

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasDownvoted ? -10 : 10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}
