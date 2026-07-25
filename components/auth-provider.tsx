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
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
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

/** Strict Mode remounts can call this twice; cache so the result is only consumed once. */
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
      return 'Popup was blocked. Allow popups and try again.'
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before finishing.'
    }
    if (code === 'auth/operation-not-allowed') {
      return 'Google sign-in is not enabled in Firebase Auth.'
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
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    const auth = getClientAuth()
    let active = true

    void readRedirectResult(auth)
      .then((result) => {
        if (!active) return
        if (result?.user) {
          const nextPath = sessionStorage.getItem('authRedirectTo')
          sessionStorage.removeItem('authRedirectTo')
          if (nextPath && window.location.pathname !== nextPath) {
            window.location.assign(nextPath)
          }
        }
      })
      .catch((error) => {
        if (active) setAuthError(toAuthMessage(error))
      })

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [configured])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      authError,
      clearAuthError() {
        setAuthError('')
      },
      async signInWithGoogle() {
        const auth = getClientAuth()
        const provider = googleProvider()
        setAuthError('')

        try {
          // Popup is more reliable on localhost than redirect + Strict Mode.
          await signInWithPopup(auth, provider)
        } catch (error) {
          const code =
            typeof error === 'object' && error && 'code' in error
              ? String((error as { code: string }).code)
              : ''

          if (
            code === 'auth/popup-blocked' ||
            code === 'auth/cancelled-popup-request'
          ) {
            sessionStorage.setItem(
              'authRedirectTo',
              `${window.location.pathname}${window.location.search}`,
            )
            await signInWithRedirect(auth, provider)
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
    [user, loading, configured, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
