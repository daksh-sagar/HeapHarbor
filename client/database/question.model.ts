import { Schema, model, models, Model } from 'mongoose'
import { IUser } from './user.model'
import { ITag } from './tag.model'

export interface IQuestion extends Document {
  title: string
  content: string
  tags: Schema.Types.ObjectId[] | ITag[]
  views: number
  upvotes: Schema.Types.ObjectId[]
  downvotes: Schema.Types.ObjectId[]
  author: Schema.Types.ObjectId | IUser
  answers: Schema.Types.ObjectId[]
  createdAt: Date
}

const QuestionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  views: { type: Number, default: 0 },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
  createdAt: { type: Date, default: Date.now },
})

export const Question: Model<IQuestion> = models.Question || model<IQuestion>('Question', QuestionSchema)
