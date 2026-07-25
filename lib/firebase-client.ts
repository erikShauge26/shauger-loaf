import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

function envConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

  if (!apiKey || !projectId || !appId || !authDomain) return null

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId,
  }
}

export function isFirebaseClientConfigured() {
  return Boolean(envConfig())
}

function clientAuthDomain(fallback: string) {
  // Same-origin auth helper via next.config rewrite of /__/auth/*.
  // Prefer http://localhost:3000 (not 127.0.0.1).
  if (typeof window === 'undefined') return fallback
  if (window.location.hostname === 'localhost') return window.location.host
  return fallback
}

function getFirebaseApp(): FirebaseApp {
  const base = envConfig()
  if (!base) {
    throw new Error('Firebase client is not configured.')
  }

  if (getApps().length) return getApp()

  return initializeApp({
    ...base,
    authDomain: clientAuthDomain(base.authDomain),
  })
}

export function getClientAuth(): Auth {
  return getAuth(getFirebaseApp())
}
