import { Schema, model, Document, models, Model, Types } from 'mongoose'

export interface IInteraction extends Document {
  user: Types.ObjectId // refence to user
  action: string
  question: Types.ObjectId // reference to question
  answer: Types.ObjectId // reference to answer
  tags: Types.ObjectId[] // reference to tag
  createdAt: Date
}

const InteractionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'Question' },
  answer: { type: Schema.Types.ObjectId, ref: 'Answer' },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
  createdAt: { type: Date, default: Date.now },
})

export const Interaction: Model<IInteraction> = models.Interaction || model<IInteraction>('Interaction', InteractionSchema)
