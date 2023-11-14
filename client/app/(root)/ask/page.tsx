import { QuestionForm } from '@/components/forms/QuestionForm'
import { getUserById } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { userId } = auth()

  if (!userId) redirect('/signin')

  const user = await getUserById({ userId })

  return (
    <div>
      <h1 className='h1-bold text-dark100_light900'>Ask a Question</h1>

      <div className='mt-9'>
        <QuestionForm mongoUserId={JSON.stringify(user?._id)} />
      </div>
    </div>
  )
}
