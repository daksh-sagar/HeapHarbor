import { Input } from '@/components/ui/input'
import Image from 'next/image'

type LocalSearchProps = {
  placeholder: string
  otherClasses?: string
  iconPosition: 'left' | 'right'
  route: string
  imgSrc: string
}

export function LocalSearchbar({ route, placeholder, iconPosition, imgSrc, otherClasses }: LocalSearchProps) {
  return (
    <div className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-xl px-4 ${otherClasses}`}>
      {iconPosition === 'left' && <Image src={imgSrc} width={24} height={24} alt='search icon' className='cursor-pointer' />}
      <Input
        type='text'
        placeholder={placeholder}
        value=''
        className='paragraph-regular no-focus background-light800_darkgradient border-none shadow-none outline-none'
      />
      {iconPosition === 'right' && <Image src={imgSrc} width={24} height={24} alt='search icon' className='cursor-pointer' />}
    </div>
  )
}
