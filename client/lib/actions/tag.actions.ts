'use server'

import { connectToDb } from '@/database/db'
import { GetTopInteractedTagsParams } from './shared.types'

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
