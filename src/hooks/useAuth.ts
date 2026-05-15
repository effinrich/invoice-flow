import { useEffect, useState } from 'react'
import { blink } from '../blink/client'
import type { User } from '@blinkdotnew/sdk'

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user ?? null)
      if (!state.isLoading) setIsLoading(false)
    })
    return unsubscribe
  }, [])

  return { user, isLoading, isAuthenticated: !!user }
}
