import { AnswerForm } from '@/components/forms/AnswerForm'
import AllAnswers from '@/components/shared/allAnswers/AllAnswers'
import Metric from '@/components/shared/metric/Metric'
import { ParseHTML } from '@/components/shared/parseHTML/ParseHTML'
import { RenderTag } from '@/components/shared/renderTag/RenderTag'
import { Votes } from '@/components/shared/votes/Votes'
import { ITag } from '@/database/tag.model'
import { IUser } from '@/database/user.model'
import { getQuestionById } from '@/lib/actions/question.actions'
import { getUserById } from '@/lib/actions/user.actions'
import { formatAndDivide, getRelativeTime } from '@/lib/utils'
import { auth } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async ({ params }: { params: { id: string } }) => {
  const result = await getQuestionById({ questionId: params.id })
  if (!result) redirect('/404')

  const { userId: clerkId } = auth()

  let mongoUser: IUser | null = null
  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId })
  }

  const tagsArray = result.tags as ITag[]
  const author = result.author as IUser

  return (
    <>
      <div className='flex-start w-full flex-col'>
        <div className='flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
          <Link href={`/profile/${author.clerkId}`} className='flex items-center justify-start gap-1'>
            <Image src={author.picture} className='rounded-full' width={22} height={22} alt='profile' />
            <p className='paragraph-semibold text-dark300_light700'>{author.name}</p>
          </Link>
          <div className='flex justify-end'>
            <Votes
              type='question'
              itemId={result._id.toString()}
              userId={mongoUser?._id?.toString()}
              upvotes={result.upvotes.length}
              hasUpvoted={result.upvotes.includes(mongoUser?._id)}
              downvotes={result.downvotes.length}
              hasDownvoted={result.downvotes.includes(mongoUser?._id)}
              hasSaved={mongoUser?.saved.includes(result._id)}
            />
          </div>
        </div>
        <h2 className='h2-semibold text-dark200_light900 mt-3.5 w-full text-left'>{result.title}</h2>
      </div>

      <div className='mb-8 mt-5 flex flex-wrap gap-4'>
        <Metric
          imgUrl='/assets/icons/clock.svg'
          alt='clock icon'
          value={` asked ${getRelativeTime(result.createdAt)}`}
          title=''
          textStyles='small-medium text-dark400_light800'
        />
        <Metric
          imgUrl='/assets/icons/message.svg'
          alt='message'
          value={formatAndDivide(result.answers.length)}
          title=' Answers'
          textStyles='small-medium text-dark400_light800'
        />
        <Metric
          imgUrl='/assets/icons/eye.svg'
          alt='eye'
          value={formatAndDivide(result.views)}
          title=' Views'
          textStyles='small-medium text-dark400_light800'
        />
      </div>

      <ParseHTML data={result.content} />

      <div className='mt-8 flex flex-wrap gap-2'>
        {tagsArray.map(tag => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} showCount={false} />
        ))}
      </div>
      <AllAnswers questionId={result._id.toString()} totalAnswers={result.answers.length} userId={mongoUser?._id} />
      <AnswerForm questionId={result._id.toString()} authorId={mongoUser?._id.toString()} question={result.content} />
    </>
  )
}

export default Page
