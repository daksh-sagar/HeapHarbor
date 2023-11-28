import { UserCard } from '@/components/cards/UserCard'
import { UserFilters } from '@/constants/filters'
import { getAllUsers } from '@/lib/actions/user.actions'
import Link from 'next/link'
import type { Metadata } from 'next'
import { LocalSearchbar } from '@/components/shared/search/LocalSearch'
import { Filter } from '@/components/shared/filter/Filter'

export const metadata: Metadata = {
  title: 'Community | HeapHarbor',
}

async function Page({ searchParams }: { searchParams: { q: string | undefined } }) {
  const res = await getAllUsers({
    searchQuery: searchParams.q,
  })

  return (
    <>
      <h1 className='h1-bold text-dark100_light900'>All Users</h1>

      <div className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearchbar
          route='/community'
          iconPosition='left'
          imgSrc='/assets/icons/search.svg'
          placeholder='Search for amazing minds'
          otherClasses='flex-1'
        />

        <Filter filters={UserFilters} otherClasses='min-h-[56px] sm:min-w-[170px]' />
      </div>

      <section className='mt-12 flex flex-wrap gap-4'>
        {res.users.length > 0 ? (
          res.users.map(user => <UserCard key={user._id.toString()} user={user} />)
        ) : (
          <div className='paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center'>
            <p>No users yet</p>
            <Link href='/signup' className='text-accent-blue mt-2 font-bold'>
              Join to be the first!
            </Link>
          </div>
        )}
      </section>
    </>
  )
}

export default Page
