'use client'

import { HomePageFilters } from '@/constants'
import { Button } from '../ui/button'

export function HomeFilters() {
  const active = 'newest'
  return (
    <div className='mt-10 hidden flex-wrap gap-3 md:flex'>
      {HomePageFilters.map(filter => (
        <Button
          key={filter.value}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${
            active === filter.value ? 'bg-primary-100 text-primary-500' : 'dark:text-light-500 text-light-400 bg-light-800 dark:bg-dark-300'
          }`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  )
}
