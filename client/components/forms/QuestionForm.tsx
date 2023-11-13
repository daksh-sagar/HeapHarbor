'use client'

import { KeyboardEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { questionFormSchema } from '@/lib/schemas'
import { Badge } from '../ui/badge'
import Image from 'next/image'
import { createQuestion } from '@/lib/actions/question.actions'

export function QuestionForm({ mongoUserId }: { mongoUserId: string }) {
  const form = useForm<z.infer<typeof questionFormSchema>>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      title: 'where is the default ??',
      explanation: '',
      tags: ['react', 'sql'],
    },
  })

  async function onSubmit(values: z.infer<typeof questionFormSchema>) {
    try {
      await createQuestion({
        title: values.title,
        content: values.explanation,
        tags: values.tags,
        author: JSON.parse(mongoUserId),
        path: '/',
      })
    } catch (error) {
      console.log(error)
    }
  }

  function handleTagKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    field: ControllerRenderProps<
      {
        title: string
        explanation: string
        tags: string[]
      },
      'tags'
    >,
  ) {
    if (e.key === ' ' && field.name === 'tags') {
      e.preventDefault()

      const tagInput = e.target as HTMLInputElement
      const tagValue = tagInput.value.trim()

      if (tagValue !== '') {
        if (tagValue.length > 15) {
          return form.setError('tags', {
            type: 'required',
            message: 'Tag must be less than 15 characters.',
          })
        }

        if (!field.value.includes(tagValue)) {
          field.onChange([...field.value, tagValue])
          tagInput.value = ''
          form.clearErrors('tags')
        }
      }
    }
  }

  function handleTagRemove(
    tag: string,
    field: ControllerRenderProps<
      {
        title: string
        explanation: string
        tags: string[]
      },
      'tags'
    >,
  ) {
    const newTags = field.value.filter(t => t !== tag)
    field.onChange(newTags)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col gap-10'>
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col'>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Question Title <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <Input
                  className='no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormDescription className='body-regular text-light-500 mt-2.5'>
                Be specific and post all the relevant details about the question as possible.
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='explanation'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col gap-3'>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Question Explanation <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <Input
                  className='no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border'
                  {...field}
                />
              </FormControl>
              <FormDescription className='body-regular mt-2.5 text-light-500'>
                Introduce the problem and expand on what you put in the title. Minimum 20 characters.
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem className='flex w-full flex-col'>
              <FormLabel className='paragraph-semibold text-dark400_light800'>
                Tags <span className='text-primary-500'>*</span>
              </FormLabel>
              <FormControl className='mt-3.5'>
                <>
                  <Input
                    className='no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border'
                    placeholder='Add tags...'
                    onKeyDown={e => handleTagKeyDown(e, field)}
                  />

                  {field.value.length > 0 && (
                    <div className='flex-start mt-2.5 gap-2.5'>
                      {field.value.map(tag => (
                        <Badge
                          key={tag}
                          onClick={() => handleTagRemove(tag, field)}
                          className='subtle-medium background-light800_dark300 text-light400_light500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize'
                        >
                          {tag}
                          <Image
                            src='/assets/icons/close.svg'
                            alt='Close icon'
                            width={12}
                            height={12}
                            className='cursor-pointer object-contain invert-0 dark:invert'
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              </FormControl>
              <FormDescription className='body-regular mt-2.5 text-light-500'>
                Add up to 5 tags to describe what your question is about. You need to press `Space` to add a tag.
              </FormDescription>
              <FormMessage className='text-red-500' />
            </FormItem>
          )}
        />
        <Button type='submit' className='primary-gradient w-fit !text-light-900' disabled={form.formState.isSubmitting}>
          Ask Question
        </Button>
      </form>
    </Form>
  )
}
