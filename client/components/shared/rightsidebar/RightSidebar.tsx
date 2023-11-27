import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { RenderTag } from '../renderTag/RenderTag'
import { getHotQuestions } from '@/lib/actions/question.actions'
import { getPopularTags } from '@/lib/actions/tag.actions'

export async function RightSidebar() {
  const hotQuestions = await getHotQuestions()
  const popularTags = await getPopularTags()
  return (
    <section className='background-light900_dark200 light-border custom-scrollbar shadow-light-300 sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 dark:shadow-none max-xl:hidden'>
      <div>
        <h3 className='h3-bold text-dark200_light900'>Top Questions</h3>
        <div className='mt-7 flex w-full flex-col gap-[30px]'>
          {hotQuestions.map(question => (
            <Link
              href={`/question/${question._id}`}
              key={question._id.toString()}
              className='flex cursor-pointer items-center justify-between gap-7'
            >
              <p className='body-medium text-dark500_light700'>{question.title}</p>
              <Image src='/assets/icons/chevron-right.svg' alt='chevron right' width={20} height={20} className='invert-colors' />
            </Link>
          ))}
        </div>
      </div>
      <div className='mt-16'>
        <h3 className='h3-bold text-dark200_light900'>Popular Tags</h3>
        <div className='mt-7 flex flex-col gap-4'>
          {popularTags.map(tag => (
            <RenderTag key={tag._id} _id={tag._id} name={tag.name} count={tag.numberOfQuestions} showCount />
          ))}
        </div>
      </div>
    </section>
  )
}
