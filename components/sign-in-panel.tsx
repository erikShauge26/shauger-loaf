'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { DEMO_ACCOUNT } from '@/lib/demo-account'

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
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before finishing.'
    }
    if (code === 'auth/popup-blocked') {
      return 'Popup was blocked. Use the demo login below, or allow popups.'
    }
    if (code === 'auth/operation-not-allowed') {
      return 'That sign-in method is not enabled in Firebase Auth.'
    }
    return `Sign-in failed (${code}).`
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
    finishingGoogle,
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    createAccountWithEmail,
  } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const shownError = error || authError

  if (!configured) {
    return (
      <div className="auth-panel">
        <h2>{title}</h2>
        <p>Firebase login is not configured yet.</p>
      </div>
    )
  }

  if (finishingGoogle) {
    return (
      <div className="auth-panel">
        <h2>Finishing Google sign-in…</h2>
        <p>One moment while we bring you back into Shauger Loaf.</p>
      </div>
    )
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    clearAuthError()
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

  async function handleDemo() {
    setBusy(true)
    setError('')
    clearAuthError()
    setEmail(DEMO_ACCOUNT.email)
    setPassword(DEMO_ACCOUNT.password)
    try {
      await signInWithEmail(DEMO_ACCOUNT.email, DEMO_ACCOUNT.password)
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
        variant="secondary"
        size="lg"
        disabled={busy}
        onClick={() => void handleDemo()}
      >
        {busy ? 'Signing in…' : 'Use demo account'}
      </Button>
      <p className="optional">
        Demo: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}
      </p>

      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          setError('')
          clearAuthError()
          void signInWithGoogle()
            .then(() => onSignedIn?.())
            .catch((err) => setError(authErrorMessage(err)))
            .finally(() => setBusy(false))
        }}
      >
        {busy ? 'Working…' : 'Continue with Google'}
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
        {shownError ? <p className="form-error">{shownError}</p> : null}
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
