'use server'

import { connectToDb } from '@/database/db'
import { GetAllTagsParams, GetTopInteractedTagsParams } from './shared.types'
import { Tag } from '@/database/tag.model'

export async function getTopInteractedTags(params: GetTopInteractedTagsParams) {
  try {
    await connectToDb()

    // const { userId, limit = 3 } = params

    // const user = await User.findById({ userId })

    // get top tags from the interactions that the user has made so far

    return [
      { _id: '1', name: 'tag1' },
      { _id: '2', name: 'tag2' },
    ]
  } catch (error) {
    console.error(error)
    throw error
  }
}

export async function getAllTags(params: GetAllTagsParams) {
  try {
    await connectToDb()

    const tags = await Tag.find({}).sort({ createdAt: -1 })
    return { tags }
  } catch (error) {
    console.error(error)
    throw error
  }
}
