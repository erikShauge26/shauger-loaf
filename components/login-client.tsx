'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignInPanel } from '@/components/sign-in-panel'
import { useAuth } from '@/components/auth-provider'

export function LoginClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') || '/track'

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, next, router])

  return (
    <SignInPanel
      title="Sign in to Shauger Loaf"
      onSignedIn={() => router.replace(next)}
    />
  )
}
