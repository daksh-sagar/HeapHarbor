import { formatAndDivide } from '@/lib/utils'
import Image from 'next/image'

type StatsCardProps = {
  imgUrl: string
  value: number
  title: string
}

const StatsCard = ({ imgUrl, value, title }: StatsCardProps) => {
  return (
    <div className='light-border background-light900_dark300 shadow-light-300 dark:shadow-dark-200 flex flex-wrap items-center justify-start gap-4 rounded-md border p-6'>
      <Image src={imgUrl} alt={title} width={40} height={50} />
      <div>
        <p className='paragraph-semibold text-dark200_light900'>{value}</p>
        <p className='body-medium text-dark400_light700'>{title}</p>
      </div>
    </div>
  )
}

type Props = {
  totalQuestions: number
  totalAnswers: number
  reputation: number
  badgeCounts: {
    GOLD: number
    SILVER: number
    BRONZE: number
  }
}

export const Stats = ({ totalQuestions, totalAnswers, reputation, badgeCounts }: Props) => {
  return (
    <div className='mt-10'>
      <h4 className='h3-semibold text-dark200_light900'>Current Reputation - {reputation}</h4>

      <div className='xs:grid-cols-2 mt-5 grid grid-cols-1 gap-5 md:grid-cols-4'>
        <div className='light-border background-light900_dark300 shadow-light-300 dark:shadow-dark-200 flex flex-wrap items-center justify-evenly gap-4 rounded-md border p-6'>
          <div>
            <p className='paragraph-semibold text-dark200_light900'>{formatAndDivide(totalQuestions)}</p>
            <p className='body-medium text-dark400_light700'>Questions</p>
          </div>
          <div>
            <p className='paragraph-semibold text-dark200_light900'>{formatAndDivide(totalAnswers)}</p>
            <p className='body-medium text-dark400_light700'>Answers</p>
          </div>
        </div>

        <StatsCard imgUrl='/assets/icons/gold-medal.svg' value={badgeCounts.GOLD} title='Gold Badges' />

        <StatsCard imgUrl='/assets/icons/silver-medal.svg' value={badgeCounts.SILVER} title='Silver Badges' />

        <StatsCard imgUrl='/assets/icons/bronze-medal.svg' value={badgeCounts.BRONZE} title='Bronze Badges' />
      </div>
    </div>
  )
}
