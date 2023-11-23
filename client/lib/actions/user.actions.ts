'use server'

import { connectToDb } from '@/database/db'
import { User } from '@/database/user.model'
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from './shared.types'
import { revalidatePath } from 'next/cache'
import { Question } from '@/database/question.model'
import { Types } from 'mongoose'
import { Tag } from '@/database/tag.model'

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

    const users = await User.find({}).sort({ createdAt: -1 })
    return { users }
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

    // also delete other data associated with the user (questions, answers, interactions)

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

    const isQuestionSaved = user.saved.includes(new Types.ObjectId(questionId))

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

    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params

    const skipAmount = (page - 1) * pageSize

    const query = searchQuery ? { title: { $regex: new RegExp(searchQuery, 'i') } } : {}

    let sortOptions = {}

    switch (filter) {
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

    const savedQuestions = user.saved

    return { questions: savedQuestions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
