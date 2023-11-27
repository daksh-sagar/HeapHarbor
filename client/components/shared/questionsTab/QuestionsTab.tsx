import { QuestionCard } from '@/components/cards/QuestionCard'
import { ITag } from '@/database/tag.model'
import { IUser } from '@/database/user.model'
import { getUserQuestions } from '@/lib/actions/user.actions'
import { URLProps } from '@/types'

type Props = {
  userId: string
  clerkId?: string | null
  searchParams: Pick<URLProps, 'searchParams'>['searchParams']
}

export const QuestionsTab = async ({ userId, clerkId }: Props) => {
  const result = await getUserQuestions({
    userId,
  })

  return (
    <>
      {result.questions.map(question => (
        <QuestionCard
          key={question._id.toString()}
          _id={question._id.toString()}
          clerkId={clerkId}
          title={question.title}
          tags={question.tags as ITag[]}
          author={question.author as IUser}
          upvotes={question.upvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
        />
      ))}
    </>
  )
}
