'use client'

import { toast } from '@/components/ui/use-toast'
import { downvoteAnswer, upvoteAnswer } from '@/lib/actions/answer.actions'
import { viewQuestion } from '@/lib/actions/interaction.actions'
import { downvoteQuestion, upvoteQuestion } from '@/lib/actions/question.actions'
import { toggleSaveQuestion } from '@/lib/actions/user.actions'
import { formatAndDivide } from '@/lib/utils'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

type voteType = 'upvote' | 'downvote'
type VotesProps = {
  type: 'question' | 'answer'
  itemId: string
  userId: string // TODO: userId can be undefined if a user is not logged in, need to take care of this
  upvotes: number
  hasUpvoted: boolean
  downvotes: number
  hasDownvoted: boolean
  hasSaved?: boolean
}

export function Votes({ type, itemId, userId, upvotes, downvotes, hasDownvoted, hasUpvoted, hasSaved }: VotesProps) {
  const pathname = usePathname()

  const handleVote = (action: voteType) => async () => {
    if (!userId) {
      return toast({
        title: 'Please log in',
        description: `You must be logged in to upvote/downvote ${type === 'question' ? 'a question' : 'an answer'}`,
      })
    }
    if (action === 'upvote') {
      if (type === 'question') {
        await upvoteQuestion({
          questionId: itemId,
          userId,
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      } else if (type === 'answer') {
        await upvoteAnswer({
          answerId: itemId,
          userId,
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      }

      return toast({
        description: `Upvote ${hasUpvoted ? 'removed' : 'added'}`,
      })
    }

    if (action === 'downvote') {
      if (type === 'question') {
        await downvoteQuestion({
          questionId: itemId,
          userId,
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      } else if (type === 'answer') {
        await downvoteAnswer({
          answerId: itemId,
          userId,
          hasUpvoted,
          hasDownvoted,
          path: pathname,
        })
      }
      return toast({
        description: `Downvote ${hasDownvoted ? 'removed' : 'added'}`,
      })
    }
  }

  async function handleSaveQuestion() {
    await toggleSaveQuestion({
      userId,
      questionId: itemId,
      path: pathname,
    })
    return toast({
      description: `Question ${hasSaved ? 'removed from saved questions' : 'added to saved questions'}`,
    })
  }

  useEffect(() => {
    viewQuestion({
      questionId: itemId,
      userId,
    })
  }, [userId, itemId])

  return (
    <div className='flex gap-5'>
      <div className='flex-center gap-2.5'>
        <div className='flex-center gap-1.5'>
          <Image
            src={hasUpvoted ? '/assets/icons/upvoted.svg' : '/assets/icons/upvote.svg'}
            width={18}
            height={18}
            alt='upvote'
            className='cursor-pointer'
            onClick={handleVote('upvote')}
          />

          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p className='subtle-medium text-dark400_light900'>{formatAndDivide(upvotes)}</p>
          </div>
        </div>

        <div className='flex-center gap-1.5'>
          <Image
            src={hasDownvoted ? '/assets/icons/downvoted.svg' : '/assets/icons/downvote.svg'}
            width={18}
            height={18}
            alt='downvote'
            className='cursor-pointer'
            onClick={handleVote('downvote')}
          />

          <div className='flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1'>
            <p className='subtle-medium text-dark400_light900'>{formatAndDivide(downvotes)}</p>
          </div>
        </div>
      </div>

      {type === 'question' && (
        <Image
          src={hasSaved ? '/assets/icons/star-filled.svg' : '/assets/icons/star-red.svg'}
          width={18}
          height={18}
          alt='star'
          className='cursor-pointer'
          onClick={handleSaveQuestion}
        />
      )}
    </div>
  )
}
