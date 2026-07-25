'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth'
import {
  getClientAuth,
  isFirebaseClientConfigured,
} from '@/lib/firebase-client'

type AuthContextValue = {
  user: User | null
  loading: boolean
  finishingGoogle: boolean
  configured: boolean
  authError: string
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  createAccountWithEmail: (email: string, password: string) => Promise<void>
  logOut: () => Promise<void>
  getIdToken: () => Promise<string | null>
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

let redirectResultPromise: Promise<UserCredential | null> | null = null

function readRedirectResult(auth: Auth) {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth)
      .then((result) => result)
      .catch((error) => {
        redirectResultPromise = null
        throw error
      })
  }
  return redirectResultPromise
}

function googleProvider() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return provider
}

function toAuthMessage(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not allowed in Firebase Auth settings.'
    }
    if (code === 'auth/popup-blocked') {
      return 'Popup was blocked. Allow popups, or use the demo email login below.'
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before finishing.'
    }
    if (code === 'auth/operation-not-allowed') {
      return 'That sign-in method is not enabled in Firebase Auth.'
    }
    if (code === 'auth/account-exists-with-different-credential') {
      return 'An account already exists with this email using a different sign-in method.'
    }
    return `Sign-in failed (${code}).`
  }
  return 'Could not finish Google sign-in.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseClientConfigured()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(configured)
  const [finishingGoogle, setFinishingGoogle] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const auth = getClientAuth()
    let active = true

    void setPersistence(auth, browserLocalPersistence).catch(() => undefined)

    if (sessionStorage.getItem('authRedirectPending') === '1') {
      setFinishingGoogle(true)
    }

    void readRedirectResult(auth)
      .then((result) => {
        if (!active) return
        sessionStorage.removeItem('authRedirectPending')
        if (result?.user) {
          const nextPath = sessionStorage.getItem('authRedirectTo') || '/track'
          sessionStorage.removeItem('authRedirectTo')
          if (window.location.pathname !== nextPath) {
            window.location.replace(nextPath)
            return
          }
        }
        setFinishingGoogle(false)
      })
      .catch((error) => {
        if (!active) return
        sessionStorage.removeItem('authRedirectPending')
        setFinishingGoogle(false)
        setAuthError(toAuthMessage(error))
      })

    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      if (nextUser) setFinishingGoogle(false)
    })

    // Don't leave the UI stuck on "…" if Auth hangs on a bad domain.
    const timeout = window.setTimeout(() => {
      if (active) setLoading(false)
    }, 4000)

    return () => {
      active = false
      window.clearTimeout(timeout)
      unsub()
    }
  }, [configured])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      finishingGoogle,
      configured,
      authError,
      clearAuthError() {
        setAuthError('')
      },
      async signInWithGoogle() {
        const auth = getClientAuth()
        setAuthError('')
        const params = new URLSearchParams(window.location.search)
        const next = params.get('next')
        sessionStorage.setItem(
          'authRedirectTo',
          next ||
            (window.location.pathname.startsWith('/login')
              ? '/track'
              : window.location.pathname),
        )

        try {
          await signInWithPopup(auth, googleProvider())
        } catch (error) {
          const code =
            typeof error === 'object' && error && 'code' in error
              ? String((error as { code: string }).code)
              : ''
          // Same-origin /__/auth proxy makes redirect reliable when popup fails.
          if (
            code === 'auth/popup-blocked' ||
            code === 'auth/popup-closed-by-user' ||
            code === 'auth/cancelled-popup-request'
          ) {
            sessionStorage.setItem('authRedirectPending', '1')
            await signInWithRedirect(auth, googleProvider())
            return
          }
          throw error
        }
      },
      async signInWithEmail(email, password) {
        setAuthError('')
        await signInWithEmailAndPassword(getClientAuth(), email, password)
      },
      async createAccountWithEmail(email, password) {
        setAuthError('')
        await createUserWithEmailAndPassword(getClientAuth(), email, password)
      },
      async logOut() {
        await signOut(getClientAuth())
      },
      async getIdToken() {
        if (!user) return null
        return user.getIdToken()
      },
    }),
    [user, loading, finishingGoogle, configured, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
