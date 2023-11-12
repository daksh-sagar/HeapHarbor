import { QuestionCard } from '@/components/cards/QuestionCard'
import { HomeFilters } from '@/components/home/HomeFilters'
import { Filter } from '@/components/shared/filter/Filter'
import { NoResult } from '@/components/shared/noResult/NoResult'
import { LocalSearchbar } from '@/components/shared/search/LocalSearch'
import { Button } from '@/components/ui/button'
import { HomePageFilters } from '@/constants'
import Link from 'next/link'

const questions = [
  {
    _id: '1',
    title: 'Sample Question 1',
    tags: [
      { _id: 1, name: 'Tag A' },
      { _id: 2, name: 'Tag B' },
    ],
    upvotes: 10,
    views: 100,
    answers: [
      { answerId: 'answer1', text: 'This is an answer.' },
      { answerId: 'answer2', text: 'Another answer here.' },
    ],
    createdAt: new Date(),
    author: {
      _id: 1,
      name: 'John Doe',
      picture: '/assets/icons/clock.svg',
    },
  },
  {
    _id: '2',
    title: 'Sample Question 2',
    tags: [
      { _id: 3, name: 'Tag C' },
      { _id: 4, name: 'Tag D' },
    ],
    upvotes: 8,
    views: 80,
    answers: [
      { answerId: 'answer3', text: 'Answer to the second question.' },
      { answerId: 'answer4', text: 'Yet another answer.' },
    ],
    createdAt: new Date(),
    author: {
      _id: 2,
      name: 'Jane Doe',
      picture: '/assets/icons/avatar.svg',
    },
  },
]

export default function Home() {
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

      <HomeFilters />

      <div className='mt-10 flex w-full flex-col gap-6'>
        {questions.length > 0 ? (
          questions.map(question => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
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
      {/* <div className='mt-10'>
        <Pagination pageNumber={searchParams?.page ? +searchParams.page : 1} isNext={result.isNext} />
      </div> */}
    </>
  )
}
