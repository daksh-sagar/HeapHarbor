import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import qs from 'query-string'
import { BadgeCriteriaType } from '@/types'
import { BADGE_CRITERIA } from '@/constants'

dayjs.extend(relativeTime)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(date: Date) {
  return dayjs(date).fromNow()
}

export function formatAndDivide(num: number): string {
  const m = 1e6
  const k = 1e3

  if (num >= m) return (num / m).toFixed(2) + 'M'
  if (num >= k) return (num / k).toFixed(2) + 'K'
  return num.toString()
}

type UrlQueryParams = {
  params: string
  key: string
  value: string | null
}

export function createUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params)

  currentUrl[key] = value

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  )
}

export function updateQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params)
  currentUrl[key] = value

  return qs.stringify(currentUrl, { skipNull: true })
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: number

  return (...args: Parameters<T>): void => {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

export function assignBadges(stats: { type: BadgeCriteriaType; count: number }[]) {
  const badges = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  }

  stats.forEach(stat => {
    const { type, count } = stat
    const badgeLevels: { [key: string]: number } = BADGE_CRITERIA[type]

    Object.keys(badgeLevels).forEach(level => {
      if (count >= badgeLevels[level]) {
        badges[level as keyof typeof badges] += 1
      }
    })
  })

  return badges
}
