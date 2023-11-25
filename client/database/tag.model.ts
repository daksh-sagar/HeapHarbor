import { Schema, model, Document, models, Model, Types } from 'mongoose'
import { IQuestion } from './question.model'

export interface ITag extends Document {
  name: string
  description: string
  questions: Types.ObjectId[] | IQuestion[]
  followers: Types.ObjectId[]
  createdOn: Date
}

const TagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdOn: { type: Date, default: Date.now },
})

export const Tag: Model<ITag> = models.Tag || model<ITag>('Tag', TagSchema)
