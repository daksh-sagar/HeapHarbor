import { Schema, model, models, Document, Model, Types } from 'mongoose'
import { IUser } from './user.model'
import { IQuestion } from './question.model'

export interface IAnswer extends Document {
  author: Types.ObjectId | IUser
  question: Types.ObjectId | IQuestion
  content: string
  upvotes: Types.ObjectId[]
  downvotes: Types.ObjectId[]
  createdAt: Date
}

const AnswerSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  upvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  downvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const Answer: Model<IAnswer> = models.Answer || model<IAnswer>('Answer', AnswerSchema)
