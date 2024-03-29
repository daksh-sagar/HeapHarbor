import { QuestionCard } from '@/components/cards/QuestionCard'
import { HomeFilters } from '@/components/home/HomeFilters'
import { Filter } from '@/components/shared/filter/Filter'
import { NoResult } from '@/components/shared/noResult/NoResult'
import { Pagination } from '@/components/shared/pagination/Pagination'
import { LocalSearchbar } from '@/components/shared/search/LocalSearch'
import { Button } from '@/components/ui/button'
import { HomePageFilters } from '@/constants'
import { ITag } from '@/database/tag.model'
import { IUser } from '@/database/user.model'
import { getQuestions } from '@/lib/actions/question.actions'
import { SearchParams } from '@/types'
import Link from 'next/link'

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const res = await getQuestions({
    searchQuery: searchParams.q,
    sort: searchParams.sort,
    page: searchParams.page ? +searchParams.page : undefined,
  })

  searchParams.toString = function (this: SearchParams) {
    const queryString = Object.entries(this)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }
        return ''
      })
      .filter(Boolean)
      .join('&')

    return '?' + queryString
  }

  const questions = res?.questions
  const isNext = res?.isNext ?? false
  return (
    <>
      <div className='flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center'>
        <h1 className='h1-bold text-dark100_light900'>All Questions</h1>

        <Link href='/ask' className='flex justify-end max-sm:w-full'>
          <Button className='primary-gradient !text-light-900 min-h-[46px] px-4 py-3'>Ask a Question</Button>
        </Link>
      </div>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search for questions'
          otherClasses='flex-1'
        />

        <Filter filters={HomePageFilters} otherClasses='min-h-[56px] sm:min-w-[170px]' containerClasses='hidden max-md:flex' />
      </div>

      <HomeFilters searchParams={searchParams} />

      <div className='mt-10 flex w-full flex-col gap-6'>
        {questions && questions.length > 0 ? (
          questions.map(question => (
            <QuestionCard
              key={question._id.toString()}
              _id={question._id.toString()}
              title={question.title}
              tags={question.tags as Array<ITag>}
              author={question.author as IUser}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title='There are no questions to show'
            description='Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡'
            link='/ask'
            linkTitle='Ask a Question'
          />
        )}
      </div>
      <Pagination pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={isNext} />
    </>
  )
}
