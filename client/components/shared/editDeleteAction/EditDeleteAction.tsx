'use client'

import { deleteAnswer } from '@/lib/actions/answer.actions'
import { deleteQuestion } from '@/lib/actions/question.actions'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  type: 'question' | 'answer'
  itemId: string
}

export function EditDeleteAction({ type, itemId }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  function handleEdit() {
    router.push(`/question/edit/${itemId}`)
  }

  async function handleDelete() {
    if (type === 'question') {
      await deleteQuestion({
        questionId: itemId,
        path: pathname,
      })
    } else if (type === 'answer') {
      await deleteAnswer({
        answerId: itemId,
        path: pathname,
      })
    }
  }
  return (
    <div className='flex items-center justify-end gap-3 max-sm:w-full'>
      {type === 'question' && (
        <Image
          src='/assets/icons/edit.svg'
          alt='Edit'
          width={14}
          height={14}
          className='cursor-pointer object-contain'
          onClick={handleEdit}
        />
      )}

      <Image
        src='/assets/icons/trash.svg'
        alt='Delete'
        width={14}
        height={14}
        className='cursor-pointer object-contain'
        onClick={handleDelete}
      />
    </div>
  )
}
