'use server'

import { connectToDb } from '@/database/db'
import { Question } from '@/database/question.model'
import { Tag } from '@/database/tag.model'
import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongoose'
import { CreateQuestionParams, GetQuestionsParams } from './shared.types'
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
  }
}