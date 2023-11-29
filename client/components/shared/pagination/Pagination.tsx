'use client'

import { Button } from '@/components/ui/button'
import { createUrlQuery } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'

type PaginationProps = {
  pageNumber: number
  isNext: boolean
}

export function Pagination({ pageNumber, isNext }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleNavigation = (direction: string) => {
    const nextPageNumber = direction === 'prev' ? pageNumber - 1 : pageNumber + 1

    const newUrl = createUrlQuery({
      params: searchParams.toString(),
      key: 'page',
      value: nextPageNumber.toString(),
    })

    router.push(newUrl)
  }

  if (!isNext && pageNumber === 1) return null

  return (
    <div className='mt-10 flex w-full items-center justify-center gap-2'>
      <Button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation('prev')}
        className='light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border'
      >
        <p className='body-medium text-dark200_light800'>Prev</p>
      </Button>
      <div className='bg-primary-500 flex items-center justify-center rounded-md px-3.5 py-2'>
        <p className='body-semibold text-light-900'>{pageNumber}</p>
      </div>
      <Button
        disabled={!isNext}
        onClick={() => handleNavigation('next')}
        className='light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border'
      >
        <p className='body-medium text-dark200_light800'>Next</p>
      </Button>
    </div>
  )
}
