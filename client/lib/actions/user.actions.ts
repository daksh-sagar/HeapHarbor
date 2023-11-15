'use server'

import { connectToDb } from '@/database/db'
import { User } from '@/database/user.model'
import { CreateUserParams, DeleteUserParams, GetAllUsersParams, GetUserByIdParams, UpdateUserParams } from './shared.types'
import { revalidatePath } from 'next/cache'
import { Question } from '@/database/question.model'

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
