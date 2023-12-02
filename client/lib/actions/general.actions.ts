'use server'

import { Answer, IAnswer } from '@/database/answer.model'
import { connectToDb } from '@/database/db'
import { IQuestion, Question } from '@/database/question.model'
import { ITag, Tag } from '@/database/tag.model'
import { IUser, User } from '@/database/user.model'
import { Model } from 'mongoose'

const searchables = ['question', 'answer', 'user', 'tag']

export async function globalSearch(params: { query?: string; type?: string }) {
  try {
    await connectToDb()

    const { query, type } = params
    const regexQuery = { $regex: query, $options: 'i' }

    let results: any[] = []

    const modelsAndTypes: { model: Model<IQuestion | IUser | IAnswer | ITag>; searchField: string; type: string }[] = [
      { model: Question, searchField: 'title', type: 'question' },
      { model: User, searchField: 'name', type: 'user' },
      { model: Answer, searchField: 'content', type: 'answer' },
      { model: Tag, searchField: 'name', type: 'tag' },
    ]

    const typeLower = type?.toLowerCase()

    if (!typeLower || !searchables.includes(typeLower)) {
      // SEARCH ACROSS EVERYTHING

      const promises = modelsAndTypes.map(async ({ model, searchField, type }) => {
        const queryResults = await model.find({ [searchField]: regexQuery }).limit(2)

        return { queryResults, searchField, type }
      })

      const res = await Promise.all(promises)

      res.forEach(({ queryResults, searchField, type }) => {
        results.push(
          ...queryResults.map((item: any) => ({
            title: item[searchField],
            type,
            id: type === 'user' ? item.clerkid : type === 'answer' ? item.question : item._id,
          })),
        )
      })
    } else {
      // SEARCH IN THE SPECIFIED MODEL TYPE
      const modelInfo = modelsAndTypes.find(item => item.type === type)

      console.log({ modelInfo, type })
      if (!modelInfo) {
        throw new Error('Invalid search type')
      }

      const queryResults = await modelInfo.model.find({ [modelInfo.searchField]: regexQuery }).limit(8)

      results = queryResults.map((item: any) => ({
        title: item[modelInfo.searchField],
        type,
        id: type === 'user' ? item.clerkId : type === 'answer' ? item.question : item._id,
      }))
    }

    return JSON.stringify(results)
  } catch (error) {
    console.log(`Error fetching global results, ${error}`)
    throw error
  }
}
