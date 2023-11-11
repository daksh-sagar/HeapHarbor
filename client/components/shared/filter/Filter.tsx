'use client'

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FilterProps = {
  filters: Array<{ name: string; value: string }>
  otherClasses?: string
  containerClasses?: string
}

export function Filter({ filters, otherClasses, containerClasses }: FilterProps) {
  return (
    <div className={`relative ${containerClasses}`}>
      <Select>
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          <div className='line-clamp-1 flex-1 text-left'>
            <SelectValue placeholder='Select a Filter' />
          </div>
        </SelectTrigger>
        <SelectContent className='text-dark500_light700 small-regular bg-light-900 dark:bg-dark-300 border-none'>
          <SelectGroup>
            {filters.map(item => (
              <SelectItem key={item.value} value={item.value} className='focus:bg-light-800 dark:focus:bg-dark-400 cursor-pointer'>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
