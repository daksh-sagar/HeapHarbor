'use client'

import { Input } from '@/components/ui/input'
import { useClickOutside } from '@/hooks/useClickOutside'
import { createUrlQuery, debounce, removeQueryParams } from '@/lib/utils'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, useState } from 'react'
import { GlobalResult } from './GlobalResult'

export function GlobalSearch() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)

  const searchContainerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  const handleInputChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value

    if (!isOpen) setIsOpen(true)
    if (searchQuery) {
      const updatedUrl = createUrlQuery({ params: searchParams.toString(), key: 'gs', value: searchQuery })
      router.push(updatedUrl, { scroll: false })
    } else {
      const newUrl = removeQueryParams({ params: searchParams.toString(), keys: ['gs', 'type'] })
      router.push(newUrl, { scroll: false })
    }
  }, 350)

  return (
    <div className='relative w-full max-w-[600px] max-lg:hidden' ref={searchContainerRef}>
      <div className='background-light800_darkgradient relative flex min-h-[56px] grow  items-center gap-1 rounded-xl px-4'>
        <Image src='/assets/icons/search.svg' width={24} height={24} alt='search' className='cursor-pointer' />
        <Input
          type='text'
          placeholder='Search...'
          className='paragraph-regular no-focus background-light800_darkgradient border-none shadow-none outline-none'
          defaultValue={searchParams.get('gs') ?? ''}
          onChange={handleInputChange}
          onClick={() => setIsOpen(true)}
        />
      </div>
      {isOpen && <GlobalResult />}
    </div>
  )
}
