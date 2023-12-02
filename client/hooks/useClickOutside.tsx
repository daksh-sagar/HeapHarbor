import { useEffect, useRef } from 'react'

const EVENTS = ['mousedown', 'touchstart']

export function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const listener = (event: any) => {
      const { target } = event ?? {}
      if (ref.current && !ref.current.contains(target as Node)) {
        handler()
      }
    }
    EVENTS.forEach(event => {
      document.addEventListener(event, listener)
    })

    return () => {
      EVENTS.forEach(event => {
        document.removeEventListener(event, listener)
      })
    }
  }, [handler])

  return ref
}
