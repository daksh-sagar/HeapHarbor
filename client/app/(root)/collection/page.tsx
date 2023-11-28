import { QuestionCard } from '@/components/cards/QuestionCard'
import { Filter } from '@/components/shared/filter/Filter'
import { NoResult } from '@/components/shared/noResult/NoResult'
import { LocalSearchbar } from '@/components/shared/search/LocalSearch'
import { QuestionFilters } from '@/constants'
import { ITag } from '@/database/tag.model'
import { IUser } from '@/database/user.model'
import { getSavedQuestions } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs'

export default async function Collection({ searchParams }: { searchParams: { q: string } }) {
  const { userId } = auth()

  // TODO: this should be an authenticated route
  if (!userId) return null

  const result = await getSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
  })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>Saved Questions</h1>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search for questions'
          otherClasses='flex-1'
        />

        <Filter filters={QuestionFilters} otherClasses='min-h-[56px] sm:min-w-[170px]' />
      </div>

      <div className='mt-10 flex w-full flex-col gap-6'>
        {result.questions.length > 0 ? (
          result.questions.map(question => (
            <QuestionCard
              key={question._id.toString()}
              _id={question._id.toString()}
              title={question.title}
              tags={question.tags as ITag[]}
              author={question.author as IUser}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title='There’s no question saved to show'
            description='Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡'
            link='/ask-question'
            linkTitle='Ask a Question'
          />
        )}
      </div>
    </>
  )
}
