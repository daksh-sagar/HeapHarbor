import Link from 'next/link'
import Image from 'next/image'
import { getAnswers } from '@/lib/actions/answer.actions'
import { Filter } from '../filter/Filter'
import { AnswerFilters } from '@/constants'
import { getRelativeTime } from '@/lib/utils'
import { ParseHTML } from '../parseHTML/ParseHTML'
import { IUser } from '@/database/user.model'
import { Votes } from '../votes/Votes'
import { Types } from 'mongoose'

type Props = {
  questionId: string
  userId: Types.ObjectId
  totalAnswers: number
  page?: number
  filter?: string
}

const AllAnswers = async ({ questionId, userId, totalAnswers, page, filter }: Props) => {
  const result = await getAnswers({
    questionId,
    page: page ? +page : 1,
    sortBy: filter,
  })

  return (
    <div className='mt-11'>
      <div className='flex items-center justify-between'>
        <h3 className='primary-text-gradient'>{totalAnswers} Answers</h3>

        <Filter filters={AnswerFilters} />
      </div>

      <div>
        {result.answers.map(answer => {
          const author = answer.author as IUser
          return (
            <article key={answer._id} className='light-border-2 border-b py-10'>
              <div className='mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
                <Link href={`/profile/${author.clerkId}`} className='flex flex-1 items-start gap-1 sm:items-center'>
                  <Image src={author.picture} width={18} height={18} alt='profile' className='rounded-full object-cover max-sm:mt-0.5' />
                  <div className='flex flex-col sm:flex-row sm:items-center'>
                    <p className='body-semibold text-dark300_light700'>{author.name}</p>

                    <p className='small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1'>
                      answered {getRelativeTime(answer.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className='flex justify-end'>
                  <Votes
                    type='answer'
                    itemId={answer._id.toString()}
                    userId={userId.toString()}
                    upvotes={answer.upvotes.length}
                    hasUpvoted={answer.upvotes.includes(userId)}
                    downvotes={answer.downvotes.length}
                    hasDownvoted={answer.downvotes.includes(userId)}
                  />
                </div>
              </div>
              <ParseHTML data={answer.content} />
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default AllAnswers
