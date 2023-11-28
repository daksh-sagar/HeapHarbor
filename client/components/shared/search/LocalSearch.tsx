'use client'

import { Input } from '@/components/ui/input'
import { createUrlQuery, debounce } from '@/lib/utils'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent } from 'react'

type LocalSearchProps = {
  placeholder: string
  otherClasses?: string
  iconPosition: 'left' | 'right'
  route: string
  imgSrc: string
}

export function LocalSearchbar({ route, placeholder, iconPosition, imgSrc, otherClasses }: LocalSearchProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleInputChange = debounce((e: ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value
    if (searchQuery) {
      const updatedUrl = createUrlQuery({ params: searchParams.toString(), key: 'q', value: searchQuery })
      router.push(updatedUrl, { scroll: false })
    } else {
      const newUrl = createUrlQuery({ params: searchParams.toString(), key: 'q', value: null })
      router.push(newUrl, { scroll: false })
    }
  }, 350)

  return (
    <div className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-xl px-4 ${otherClasses}`}>
      {iconPosition === 'left' && <Image src={imgSrc} width={24} height={24} alt='search icon' className='cursor-pointer' />}
      <Input
        type='text'
        placeholder={placeholder}
        className='paragraph-regular no-focus placeholder text-dark400_light700 border-none bg-transparent shadow-none outline-none'
        onChange={handleInputChange}
        defaultValue={searchParams.get('q') ?? ''}
      />
      {iconPosition === 'right' && <Image src={imgSrc} width={24} height={24} alt='search icon' className='cursor-pointer' />}
    </div>
  )
}
