import { Suspense } from 'react'
import { LoginClient } from '@/components/login-client'

export default function LoginPage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <Suspense fallback={<p className="page-lead">Loading sign-in…</p>}>
          <LoginClient />
        </Suspense>
      </div>
    </main>
  )
}
