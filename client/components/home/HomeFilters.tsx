import { HomePageFilters } from '@/constants'
import Link from 'next/link'
import { updateQuery } from '@/lib/utils'

export function HomeFilters({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const selected = searchParams.sort ?? 'newest'
  return (
    <div className='mt-10 hidden flex-wrap gap-3 md:flex'>
      {HomePageFilters.map(filter => (
        <Link
          scroll={false}
          href={`?${updateQuery({ params: searchParams.toString(), key: 'sort', value: filter.value })}`}
          key={filter.value}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${
            selected === filter.value
              ? 'bg-primary-100 text-primary-500'
              : 'dark:text-light-500 text-light-400 bg-light-800 dark:bg-dark-300'
          }`}
        >
          {filter.name}
        </Link>
      ))}
    </div>
  )
}
