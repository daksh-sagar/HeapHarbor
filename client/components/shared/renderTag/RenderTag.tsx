import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

type Props = {
  _id: string
  name: string
  showCount?: boolean
  count?: number
}

export function RenderTag({ _id, name, count, showCount = false }: Props) {
  return (
    <Link href={`/tags/${_id}`} className='flex justify-between gap-2'>
      <Badge className='subtle-medium background-light800_dark300 text-light400_light500 rounded-md border-none px-4 py-2 uppercase'>
        {name}
      </Badge>

      {showCount && <p className='small-medium text-dark500_light700'>{count}</p>}
    </Link>
  )
}
