'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'

function authErrorMessage(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return 'Wrong email or password.'
    }
    if (code === 'auth/email-already-in-use') {
      return 'That email already has an account. Sign in instead.'
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters.'
    }
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not allowed in Firebase Auth settings.'
    }
  }
  return 'Could not sign in. Please try again.'
}

export function SignInPanel({
  title = 'Sign in',
  onSignedIn,
}: {
  title?: string
  onSignedIn?: () => void
}) {
  const {
    configured,
    signInWithGoogle,
    signInWithEmail,
    createAccountWithEmail,
  } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!configured) {
    return (
      <div className="auth-panel">
        <h2>{title}</h2>
        <p>Firebase login is not configured yet.</p>
      </div>
    )
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'signin') {
        await signInWithEmail(email.trim(), password)
      } else {
        await createAccountWithEmail(email.trim(), password)
      }
      onSignedIn?.()
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-panel">
      <h2>{title}</h2>
      <p>Sign in to preorder and track pickup day.</p>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          void signInWithGoogle()
            .catch((err) => setError(authErrorMessage(err)))
            .finally(() => setBusy(false))
        }}
      >
        Continue with Google
      </Button>

      <p className="auth-or">or email</p>

      <form className="preorder-form" onSubmit={(e) => void handleEmail(e)}>
        <label>
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>

      <button
        type="button"
        className="auth-switch"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin'
          ? 'Need an account? Create one'
          : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
