'use client'

import React, { createContext, useState, useLayoutEffect, useContext } from 'react'

type ThemeContextType = {
  mode: string
  setMode: (mode: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState('light')

  useLayoutEffect(() => {
    if (mode === 'dark') {
      setMode('dark')
      document.documentElement.classList.add('dark')
    } else {
      setMode('light')
      document.documentElement.classList.add('light')
    }
  }, [mode])

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>
}

export function useThemeContext() {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }

  return context
}
