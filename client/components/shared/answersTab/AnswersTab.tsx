import { AnswerCard } from '@/components/cards/AnswerCard'
import { IQuestion } from '@/database/question.model'
import { IUser } from '@/database/user.model'
import { getUserAnswers } from '@/lib/actions/user.actions'
import { SearchParams } from '@/types'
import { Types } from 'mongoose'
import { Pagination } from '../pagination/Pagination'

type Props = {
  userId: string
  clerkId?: string | null
  searchParams: SearchParams
}

export const AnswersTab = async ({ userId, clerkId, searchParams }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: searchParams?.page ? +searchParams.page : 1,
  })

  return (
    <>
      {result.answers.map(item => (
        <AnswerCard
          key={item._id.toString()}
          clerkId={clerkId}
          _id={item._id.toString()}
          question={item.question as IQuestion & { _id: Types.ObjectId }}
          author={item.author as IUser & { _id: Types.ObjectId }}
          upvotes={item.upvotes.length}
          createdAt={item.createdAt}
        />
      ))}
      <Pagination pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.isNext} />
    </>
  )
}
