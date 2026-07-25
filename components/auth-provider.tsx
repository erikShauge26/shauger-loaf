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
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
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
      return 'Popup was blocked. Allow popups for localhost:3000 and try again.'
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
    void setPersistence(auth, browserLocalPersistence).catch(() => undefined)

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
        setAuthError('')
        // Popup + COOP header (see next.config.mjs). Redirect fails on Chrome
        // because third-party storage between firebaseapp.com and localhost is blocked.
        await signInWithPopup(auth, googleProvider())
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
