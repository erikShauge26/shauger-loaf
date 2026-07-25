import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import {
  BAKE_STEPS,
  isBakeStatus,
  nextBakeStatus,
  type BakeStatus,
} from '@/lib/bake-status'
import { getAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase-admin'

const localFile = path.join(process.cwd(), 'data', 'preorders.json')
const COLLECTION = 'preorders'

export type Preorder = {
  id: string
  userId: string
  customerName: string
  email: string
  phone: string | null
  productSlug: string
  productName: string
  quantity: number
  pickupNote: string | null
  notes: string | null
  status: BakeStatus
  statusHistory: Partial<Record<BakeStatus, string>>
  createdAt: string
}

export type PreorderInput = {
  userId: string
  customerName: string
  email: string
  phone?: string
  productSlug: string
  productName: string
  quantity: number
  pickupNote?: string
  notes?: string
}

function stamp(): string {
  return new Date().toISOString()
}

function toRecord(input: PreorderInput) {
  const createdAt = stamp()
  return {
    userId: input.userId,
    customerName: input.customerName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    productSlug: input.productSlug,
    productName: input.productName,
    quantity: input.quantity,
    pickupNote: input.pickupNote?.trim() || null,
    notes: input.notes?.trim() || null,
    status: 'received' as BakeStatus,
    statusHistory: { received: createdAt } as Partial<Record<BakeStatus, string>>,
  }
}

function mapDoc(id: string, data: Record<string, unknown>): Preorder {
  const status = isBakeStatus(String(data.status || ''))
    ? (data.status as BakeStatus)
    : 'received'
  const historyRaw = (data.statusHistory || {}) as Record<string, unknown>
  const statusHistory: Partial<Record<BakeStatus, string>> = {}
  for (const step of BAKE_STEPS) {
    const value = historyRaw[step.id]
    if (typeof value === 'string') statusHistory[step.id] = value
    else if (value instanceof Timestamp) {
      statusHistory[step.id] = value.toDate().toISOString()
    }
  }

  const createdAt =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : String(data.createdAt || stamp())

  return {
    id,
    userId: String(data.userId ?? ''),
    customerName: String(data.customerName ?? ''),
    email: String(data.email ?? ''),
    phone: data.phone == null ? null : String(data.phone),
    productSlug: String(data.productSlug ?? ''),
    productName: String(data.productName ?? ''),
    quantity: Number(data.quantity ?? 1),
    pickupNote: data.pickupNote == null ? null : String(data.pickupNote),
    notes: data.notes == null ? null : String(data.notes),
    status,
    statusHistory,
    createdAt,
  }
}

async function readLocal(): Promise<Preorder[]> {
  try {
    const raw = await readFile(localFile, 'utf8')
    return JSON.parse(raw) as Preorder[]
  } catch {
    return []
  }
}

async function writeLocal(rows: Preorder[]) {
  await mkdir(path.dirname(localFile), { recursive: true })
  await writeFile(localFile, JSON.stringify(rows, null, 2), 'utf8')
}

export async function createPreorder(input: PreorderInput): Promise<Preorder> {
  const values = toRecord(input)

  if (isFirebaseAdminConfigured()) {
    const ref = await getAdminDb().collection(COLLECTION).add({
      ...values,
      createdAt: FieldValue.serverTimestamp(),
    })
    return {
      id: ref.id,
      ...values,
      createdAt: values.statusHistory.received || stamp(),
    }
  }

  const rows = await readLocal()
  const row: Preorder = {
    id: `local-${Date.now()}`,
    ...values,
    createdAt: values.statusHistory.received || stamp(),
  }
  rows.push(row)
  await writeLocal(rows)
  return row
}

export async function listPreordersForUser(userId: string): Promise<Preorder[]> {
  if (isFirebaseAdminConfigured()) {
    const snap = await getAdminDb()
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get()
    return snap.docs
      .map((doc) => mapDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  const rows = await readLocal()
  return rows
    .filter((row) => row.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function listAllPreorders(): Promise<Preorder[]> {
  if (isFirebaseAdminConfigured()) {
    const snap = await getAdminDb().collection(COLLECTION).get()
    return snap.docs
      .map((doc) => mapDoc(doc.id, doc.data() as Record<string, unknown>))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  return (await readLocal()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function advancePreorderStatus(id: string): Promise<Preorder | null> {
  if (isFirebaseAdminConfigured()) {
    const ref = getAdminDb().collection(COLLECTION).doc(id)
    const snap = await ref.get()
    if (!snap.exists) return null
    const current = mapDoc(snap.id, (snap.data() || {}) as Record<string, unknown>)
    const next = nextBakeStatus(current.status)
    if (!next) return current
    const at = stamp()
    await ref.update({
      status: next,
      [`statusHistory.${next}`]: at,
    })
    return {
      ...current,
      status: next,
      statusHistory: { ...current.statusHistory, [next]: at },
    }
  }

  const rows = await readLocal()
  const index = rows.findIndex((row) => row.id === id)
  if (index < 0) return null
  const current = rows[index]
  const next = nextBakeStatus(current.status)
  if (!next) return current
  const at = stamp()
  const updated = {
    ...current,
    status: next,
    statusHistory: { ...current.statusHistory, [next]: at },
  }
  rows[index] = updated
  await writeLocal(rows)
  return updated
}
