import { SignedIn, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ThemeMenu } from './ThemeMenu'
import { MobileNav } from './MobileNav'

export function Navbar() {
  return (
    <nav className='flex-between background-light900_dark200 shadow-light-300 fixed z-50 w-full gap-5 p-6 dark:shadow-none sm:px-12'>
      <Link href='/' className='flex items-center gap-1'>
        <Image src='/assets/images/site-logo.svg' width={23} height={23} alt='HeapHarbor Logo' />
        <p className='h2-bold text-dark-100 dark:text-light-900 max-sm:hidden'>
          Heap <span className='text-primary-500'>Harbor</span>
        </p>
      </Link>
      GlobalSearch
      <div className='flex-between gap-5'>
        <ThemeMenu />
        <SignedIn>
          <UserButton
            afterSignOutUrl='/'
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
              },
              variables: {
                colorPrimary: '#ff7000',
              },
            }}
          />
        </SignedIn>

        <MobileNav />
      </div>
    </nav>
  )
}
