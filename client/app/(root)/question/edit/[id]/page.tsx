import { QuestionForm } from '@/components/forms/QuestionForm'
import { IQuestion } from '@/database/question.model'
import { ITag } from '@/database/tag.model'
import { getQuestionById } from '@/lib/actions/question.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs'
import { Document, Types } from 'mongoose'

function shapeQuestion(
  question: Document<unknown, {}, IQuestion> &
    IQuestion & {
      _id: Types.ObjectId
    },
) {
  return {
    _id: question._id.toString(),
    title: question.title,
    explanation: question.content,
    tags: (question.tags as ITag[]).map(tag => tag.name),
  }
}

export default async function EditQuestion({ params }: { params: { id: string } }) {
  const { userId } = auth()

  if (!userId) return null

  const mongoUser = await getUserById({ userId })
  if (!mongoUser) return null

  const result = await getQuestionById({ questionId: params.id })
  if (!result) return null

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Edit Question</h1>

      <div className='mt-9'>
        <QuestionForm type='Edit' mongoUserId={mongoUser._id.toString()} questionDetails={shapeQuestion(result)} />
      </div>
    </>
  )
}
