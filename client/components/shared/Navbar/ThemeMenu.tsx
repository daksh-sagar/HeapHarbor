'use client'

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar'
import { themes } from '@/constants'
import { useThemeContext } from '@/contexts/ThemeContext'
import Image from 'next/image'

export function ThemeMenu() {
  const { mode, setMode } = useThemeContext()

  return (
    <Menubar className='relative border-none bg-transparent shadow-none'>
      <MenubarMenu>
        <MenubarTrigger className='focus:bg-light-900 data-[state=open]:bg-light-900 dark:focus:bg-dark-200 dark:data-[state=open]:bg-dark-200'>
          {mode === 'dark' ? (
            <Image src='/assets/icons/moon.svg' alt='moon' width={20} height={20} className='active-theme' />
          ) : (
            <Image src='/assets/icons/sun.svg' alt='sun' width={20} height={20} />
          )}
        </MenubarTrigger>
        <MenubarContent className='dark:border-dark-400 dark:bg-dark-300 absolute right-[-3rem] mt-3 min-w-[120px] rounded border py-2'>
          {themes.map(item => (
            <MenubarItem
              key={item.value}
              className='dark:focus:bg-dark-400 flex items-center gap-4 px-2.5 py-2'
              onClick={() => {
                setMode(item.value)
                if (item.value === 'system') {
                  localStorage.removeItem('theme')
                } else {
                  localStorage.setItem('theme', item.value)
                }
              }}
            >
              <Image src={item.icon} alt={item.label} width={16} height={16} className={mode === item.value ? 'active-theme' : ''} />
              <p className={`body-semibold text-light-500 ${mode === item.value ? 'text-primary-500' : 'text-dark100_light900'}`}>
                {item.label}
              </p>
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
