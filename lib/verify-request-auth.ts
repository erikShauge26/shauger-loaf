import type { DecodedIdToken } from 'firebase-admin/auth'
import {
  getAdminAuth,
  isFirebaseAdminConfigured,
} from '@/lib/firebase-admin'

export async function verifyRequestAuth(
  request: Request,
): Promise<DecodedIdToken | null> {
  if (!isFirebaseAdminConfigured()) return null

  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null

  const token = header.slice('Bearer '.length).trim()
  if (!token) return null

  try {
    return await getAdminAuth().verifyIdToken(token)
  } catch {
    return null
  }
}
