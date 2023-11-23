'use client'

import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import { answerFormSchema } from '@/lib/schemas'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Editor } from '@tinymce/tinymce-react'
import { useThemeContext } from '@/contexts/ThemeContext'
import { Button } from '../ui/button'
import { createAnswer } from '@/lib/actions/answer.actions'
import { usePathname } from 'next/navigation'

type AnswerFormProps = {
  question: string
  questionId: string
  authorId: string
}

export const AnswerForm = ({ question, questionId, authorId }: AnswerFormProps) => {
  const path = usePathname()
  const { mode } = useThemeContext()
  const form = useForm<z.infer<typeof answerFormSchema>>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      answer: '',
    },
  })

  const {
    formState: { isSubmitting },
  } = form

  async function handleCreateAnswer(values: z.infer<typeof answerFormSchema>) {
    try {
      await createAnswer({ question: questionId, author: authorId, content: values.answer, path })
      form.reset()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div>
      <div className='mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2'>
        <h4 className='paragraph-semibold text-dark400_light800'>Write your answer here</h4>
      </div>

      <Form {...form}>
        <form className='mt-6 flex w-full flex-col gap-10' onSubmit={form.handleSubmit(handleCreateAnswer)}>
          <FormField
            control={form.control}
            name='answer'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col gap-3'>
                <FormControl className='mt-3.5'>
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onBlur={field.onBlur}
                    onEditorChange={content => field.onChange(content)}
                    value={field.value}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        'advlist',
                        'autolink',
                        'lists',
                        'link',
                        'image',
                        'charmap',
                        'preview',
                        'anchor',
                        'searchreplace',
                        'visualblocks',
                        'codesample',
                        'fullscreen',
                        'insertdatetime',
                        'media',
                        'table',
                      ],
                      toolbar:
                        'undo redo | ' +
                        'codesample | bold italic forecolor | alignleft aligncenter |' +
                        'alignright alignjustify | bullist numlist',
                      content_style: 'body { font-family:Inter; font-size:16px }',
                      skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
                      content_css: mode === 'dark' ? 'dark' : 'light',
                    }}
                  />
                </FormControl>
                <FormMessage className='text-red-500' />
              </FormItem>
            )}
          />

          <div className='flex justify-end'>
            <Button type='submit' className='primary-gradient w-fit text-white' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
