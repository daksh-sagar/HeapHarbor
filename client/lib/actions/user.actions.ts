'use server'

import { connectToDb } from '@/database/db'
import { User } from '@/database/user.model'

export async function getUserById(params: any) {
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
