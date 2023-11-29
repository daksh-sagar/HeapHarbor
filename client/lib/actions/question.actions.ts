'use server'

import { connectToDb } from '@/database/db'
import { Question } from '@/database/question.model'
import { Tag } from '@/database/tag.model'
import { revalidatePath } from 'next/cache'
import { FilterQuery, ObjectId, Types } from 'mongoose'
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from './shared.types'
import { User } from '@/database/user.model'
import { Answer } from '@/database/answer.model'
import { Interaction } from '@/database/interaction.model'

export async function getQuestions(params: GetQuestionsParams) {
  try {
    await connectToDb()

    const { searchQuery, sort, page = 1, pageSize = 10 } = params

    const skipAmount = (page - 1) * pageSize

    const query: FilterQuery<typeof Question> = {}

    if (searchQuery) {
      query.$or = [{ title: { $regex: new RegExp(searchQuery, 'i') } }, { content: { $regex: new RegExp(searchQuery, 'i') } }]
    }

    let sortOptions = {}

    switch (sort) {
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'frequent':
        sortOptions = { views: -1 }
        break
      case 'unanswered':
        query.answers = { $size: 0 }
        break
      default:
        break
    }

    const questions = await Question.find(query)
      .populate({ path: 'tags', model: Tag })
      .populate({ path: 'author', model: User })
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)

    const totalQuestions = await Question.estimatedDocumentCount(query)

    const isNext = totalQuestions > skipAmount + questions.length

    return { questions, isNext }
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
      Interaction.create({
        user: author,
        action: 'ask_question',
        question: question._id,
        tags: tagDocuments,
      }),
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
      $inc: { reputation: hasUpvoted ? -10 : hasDownvoted ? 20 : 10 },
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
      $inc: { reputation: hasDownvoted ? 10 : hasUpvoted ? -20 : -10 },
    })

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    await connectToDb()

    const { questionId, path } = params

    // TODO: deleting a question should also adjust the reputation of the users, since the question and corresponding answers have been removed as well
    // probably would be better to not let the user delete a question once it has been posted, just allow the edit

    await Promise.all([
      Question.deleteOne({ _id: questionId }),
      Answer.deleteMany({ question: questionId }),
      Interaction.deleteMany({ question: questionId }),
      Tag.updateMany({ questions: questionId }, { $pull: { questions: questionId } }),
    ])

    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    await connectToDb()

    const { questionId, title, content, path, tags: updatedTags } = params
    const question = await Question.findById(questionId)

    if (!question) return

    const existingTagIds = question.tags as Types.ObjectId[]

    const upsertTags = updatedTags.map(async tagName => {
      const tag = await Tag.findOneAndUpdate({ name: tagName }, { $addToSet: { questions: question._id } }, { upsert: true, new: true })
      return tag._id as Types.ObjectId
    })
    const updatedTagIds = await Promise.all(upsertTags)

    const tagsToRemove = existingTagIds.filter(tagId => !updatedTagIds.includes(tagId))

    const removeTags = tagsToRemove.map(async tagName => {
      return await Tag.findOneAndUpdate({ name: tagName }, { $pull: { questions: question._id } })
    })

    question.title = title
    question.content = content
    question.tags = updatedTagIds

    await Promise.all([question.save(), ...removeTags])

    revalidatePath(path)
  } catch (error) {
    console.log(error)
  }
}

export async function getHotQuestions() {
  try {
    await connectToDb()

    const hotQuestions = await Question.find({}).sort({ views: -1, upvotes: -1 }).limit(7)

    return hotQuestions
  } catch (error) {
    console.log(error)
    throw error
  }
}
