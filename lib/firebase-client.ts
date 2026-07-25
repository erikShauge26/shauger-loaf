import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

function readConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID

  if (!apiKey || !authDomain || !projectId || !appId) return null

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
  return Boolean(readConfig())
}

function getFirebaseApp(): FirebaseApp {
  const config = readConfig()
  if (!config) {
    throw new Error('Firebase client is not configured.')
  }
  return getApps().length ? getApp() : initializeApp(config)
}

export function getClientAuth() {
  return getAuth(getFirebaseApp())
}
