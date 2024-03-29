'use server'

import { connectToDb } from '@/database/db'
import { User } from '@/database/user.model'
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types'
import { revalidatePath } from 'next/cache'
import { IQuestion, Question } from '@/database/question.model'
import { Document, FilterQuery, Types } from 'mongoose'
import { Tag } from '@/database/tag.model'
import { Answer } from '@/database/answer.model'
import { BadgeCriteriaType } from '@/types'
import { assignBadges } from '../utils'

export async function getUserById(params: GetUserByIdParams) {
  try {
    await connectToDb()

    const { userId } = params

    const user = await User.findOne({ clerkId: userId })
    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDb()

    const { searchQuery, sort, page = 1, pageSize = 10 } = params
    const skipAmount = (page - 1) * pageSize

    const query: FilterQuery<typeof User> = {}

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, 'i') } }, { username: { $regex: new RegExp(searchQuery, 'i') } }]
    }
    let sortOptions = {}

    switch (sort) {
      case 'new_users':
        sortOptions = { joinedAt: -1 }
        break
      case 'old_users':
        sortOptions = { joinedAt: 1 }
        break
      case 'top_contributors':
        sortOptions = { reputation: -1 }
        break

      default:
        break
    }

    const users = await User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize)

    const totalUsers = await User.estimatedDocumentCount(query)
    const isNext = totalUsers > skipAmount + users.length

    return { users, isNext }
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function createUser(params: CreateUserParams) {
  try {
    await connectToDb()
    const user = new User(params)
    await user.save()
    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    await connectToDb()

    const { clerkId, path, updateData } = params

    const mongoUser = await User.findOneAndUpdate({ clerkId }, updateData, { new: true })
    revalidatePath(path)
    return mongoUser
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    await connectToDb()

    const { clerkId } = params

    const user = await User.findOneAndDelete({ clerkId })

    if (!user) {
      return
    }

    // TODO: also delete other data associated with the user (questions, answers, interactions)

    await Question.deleteMany({ author: user._id })

    return user
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    await connectToDb()

    const { userId, questionId, path } = params

    const user = await User.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    const saved = user.saved as Types.ObjectId[]
    const isQuestionSaved = saved.includes(new Types.ObjectId(questionId))

    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(userId, { $pull: { saved: questionId } }, { new: true })
    } else {
      // add question to saved
      await User.findByIdAndUpdate(userId, { $addToSet: { saved: questionId } }, { new: true })
    }

    revalidatePath(path)
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    await connectToDb()

    const { clerkId, searchQuery, sort, page = 1, pageSize = 20 } = params

    const skipAmount = (page - 1) * pageSize

    const query: FilterQuery<typeof Question> = searchQuery ? { title: { $regex: new RegExp(searchQuery, 'i') } } : {}

    let sortOptions = {}

    switch (sort) {
      case 'most_recent':
        sortOptions = { createdAt: -1 }
        break
      case 'oldest':
        sortOptions = { createdAt: 1 }
        break
      case 'most_voted':
        sortOptions = { upvotes: -1 }
        break
      case 'most_viewed':
        sortOptions = { views: -1 }
        break
      case 'most_answered':
        sortOptions = { answers: -1 }
        break

      default:
        break
    }

    const user = await User.findOne({ clerkId }).populate({
      path: 'saved',
      model: Question,
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isNext = user.saved.length > pageSize

    const savedQuestions = user.saved as Omit<
      Omit<
        Document<unknown, {}, IQuestion> &
          IQuestion & {
            _id: Types.ObjectId
          },
        never
      >,
      never
    >[]

    return { questions: savedQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    await connectToDb()

    const { userId } = params

    const user = await User.findOne({ clerkId: userId })

    if (!user) {
      throw new Error('User not found')
    }

    const totalQuestions = await Question.countDocuments({ author: user._id })
    const totalAnswers = await Answer.countDocuments({ author: user._id })

    // const [questionUpvotes] = await Question.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       upvotes: { $size: '$upvotes' },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalUpvotes: { $sum: '$upvotes' },
    //     },
    //   },
    // ])

    // const [answerUpvotes] = await Answer.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $project: {
    //       _id: 0,
    //       upvotes: { $size: '$upvotes' },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: null,
    //       totalUpvotes: { $sum: '$upvotes' },
    //     },
    //   },
    // ])

    // const [questionViews] = await Answer.aggregate([
    //   { $match: { author: user._id } },
    //   {
    //     $group: {
    //       _id: null,
    //       totalViews: { $sum: '$views' },
    //     },
    //   },
    // ])

    const [[quesUpvotes], [ansUpvotes], [quesViews]] = await Promise.all([
      Question.aggregate([
        { $match: { author: user._id } },
        {
          $project: {
            _id: 0,
            upvotes: { $size: '$upvotes' },
          },
        },
        {
          $group: {
            _id: null,
            totalUpvotes: { $sum: '$upvotes' },
          },
        },
      ]),
      await Answer.aggregate([
        { $match: { author: user._id } },
        {
          $project: {
            _id: 0,
            upvotes: { $size: '$upvotes' },
          },
        },
        {
          $group: {
            _id: null,
            totalUpvotes: { $sum: '$upvotes' },
          },
        },
      ]),
      Answer.aggregate([
        { $match: { author: user._id } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: '$views' },
          },
        },
      ]),
    ])

    const stats = [
      { type: 'QUESTION_COUNT' as BadgeCriteriaType, count: totalQuestions },
      { type: 'ANSWER_COUNT' as BadgeCriteriaType, count: totalAnswers },
      { type: 'QUESTION_UPVOTES' as BadgeCriteriaType, count: quesUpvotes?.totalUpvotes || 0 },
      { type: 'ANSWER_UPVOTES' as BadgeCriteriaType, count: ansUpvotes?.totalUpvotes || 0 },
      { type: 'TOTAL_VIEWS' as BadgeCriteriaType, count: quesViews?.totalViews || 0 },
    ]

    const badgeCounts = assignBadges(stats)

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    await connectToDb()

    const { userId, page = 1, pageSize = 10 } = params

    const skipAmount = (page - 1) * pageSize

    const totalQuestions = await Question.countDocuments({ author: userId })

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('tags', '_id name')
      .populate('author', '_id clerkId name picture')

    const isNext = totalQuestions > skipAmount + userQuestions.length

    return { totalQuestions, questions: userQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    await connectToDb()

    const { userId, page = 1, pageSize = 10 } = params

    const skipAmount = (page - 1) * pageSize

    const totalAnswers = await Answer.countDocuments({ author: userId })

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate('question', '_id title')
      .populate('author', '_id clerkId name picture')

    const isNext = totalAnswers > skipAmount + userAnswers.length

    return { totalAnswers, answers: userAnswers, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
