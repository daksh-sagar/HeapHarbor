import Link from 'next/link'
import { RenderTag } from '../shared/renderTag/RenderTag'
import Metric from '../shared/metric/Metric'
import { formatAndDivide, getRelativeTime } from '@/lib/utils'
import { IUser } from '@/database/user.model'
import { ITag } from '@/database/tag.model'
import { Types } from 'mongoose'
import { SignedIn } from '@clerk/nextjs'
import { EditDeleteAction } from '../shared/editDeleteAction/EditDeleteAction'

type QuestionCardProps = {
  _id: string
  title: string
  tags: Array<ITag>
  upvotes: Array<Types.ObjectId>
  views: number
  answers: Array<object>
  createdAt: Date
  author: IUser
  clerkId?: string | null
}

export function QuestionCard({ _id, clerkId, title, tags, author, upvotes, views, answers, createdAt }: QuestionCardProps) {
  const showActionButtons = clerkId && clerkId === author.clerkId
  return (
    <div className='card-wrapper rounded-[10px] p-9 sm:px-11'>
      <div className='flex flex-col-reverse items-start justify-between gap-5 sm:flex-row'>
        <div>
          <span className='subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden'>{getRelativeTime(createdAt)}</span>
          <Link href={`/question/${_id}`}>
            <h3 className='sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1'>{title}</h3>
          </Link>
        </div>
        <SignedIn>{showActionButtons && <EditDeleteAction type='question' itemId={_id} />}</SignedIn>
      </div>

      <div className='mt-3.5 flex flex-wrap gap-2'>
        {tags.map(tag => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className='flex-between mt-6 w-full flex-wrap gap-3'>
        <Metric
          imgUrl={author.picture}
          alt='user'
          value={author.name}
          title={` - asked ${getRelativeTime(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles='body-medium text-dark400_light700'
        />
        <div className='flex items-center gap-3 max-sm:flex-wrap max-sm:justify-start'>
          <Metric
            imgUrl='/assets/icons/like.svg'
            alt='Upvotes'
            value={formatAndDivide(upvotes.length)}
            title=' Votes'
            textStyles='small-medium text-dark400_light800'
          />
          <Metric
            imgUrl='/assets/icons/message.svg'
            alt='message'
            value={formatAndDivide(answers.length)}
            title=' Answers'
            textStyles='small-medium text-dark400_light800'
          />
          <Metric
            imgUrl='/assets/icons/eye.svg'
            alt='eye'
            value={formatAndDivide(views)}
            title=' Views'
            textStyles='small-medium text-dark400_light800'
          />
        </div>
      </div>
    </div>
  )
}
