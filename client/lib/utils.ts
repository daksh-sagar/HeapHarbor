import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

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
