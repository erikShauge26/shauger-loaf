'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'

export function AuthMenu() {
  const { user, loading, logOut } = useAuth()

  if (loading) {
    return <span className="nav-auth-muted">…</span>
  }

  if (!user) {
    return (
      <Link href="/login" className="nav-auth">
        Sign in
      </Link>
    )
  }

  return (
    <span className="nav-auth-row">
      <Link href="/track" className="nav-auth">
        Track
      </Link>
      <Button type="button" variant="ghost" size="sm" onClick={() => void logOut()}>
        Sign out
      </Button>
    </span>
  )
}
