'use server'

import { connectToDb } from '@/database/db'
import { GetAllTagsParams, GetQuestionsByTagIdParams, GetTopInteractedTagsParams } from './shared.types'
import { ITag, Tag } from '@/database/tag.model'
import { Document, FilterQuery, Types } from 'mongoose'
import { IQuestion, Question } from '@/database/question.model'
import { User } from '@/database/user.model'

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

export async function getQuestionsByTagId(params: GetQuestionsByTagIdParams) {
  try {
    await connectToDb()

    const { tagId, page = 1, pageSize = 10, searchQuery } = params
    const skipAmount = (page - 1) * pageSize

    const tagFilter: FilterQuery<ITag> = { _id: tagId }

    const tag = await Tag.findOne(tagFilter).populate({
      path: 'questions',
      model: Question,
      match: searchQuery ? { title: { $regex: searchQuery, $options: 'i' } } : {},
      options: {
        sort: { createdAt: -1 },
        skip: skipAmount,
        limit: pageSize + 1, // +1 to check if there is next page
      },
      populate: [
        { path: 'tags', model: Tag, select: '_id name' },
        { path: 'author', model: User, select: '_id clerkId name picture' },
      ],
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    const isNext = tag.questions.length > pageSize

    const questions = tag.questions as Omit<
      Omit<
        Document<unknown, {}, IQuestion> &
          IQuestion & {
            _id: Types.ObjectId
          },
        never
      >,
      never
    >[]

    return { tagTitle: tag.name, questions, isNext }
  } catch (error) {
    console.log(error)
    throw error
  }
}
