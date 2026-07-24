import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase-admin'

const localFile = path.join(process.cwd(), 'data', 'preorders.json')
const COLLECTION = 'preorders'

export type Preorder = {
  id: string
  customerName: string
  email: string
  phone: string | null
  productSlug: string
  productName: string
  quantity: number
  pickupNote: string | null
  notes: string | null
  status: string
  createdAt: string
}

export type PreorderInput = {
  customerName: string
  email: string
  phone?: string
  productSlug: string
  productName: string
  quantity: number
  pickupNote?: string
  notes?: string
}

function toRecord(input: PreorderInput) {
  return {
    customerName: input.customerName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    productSlug: input.productSlug,
    productName: input.productName,
    quantity: input.quantity,
    pickupNote: input.pickupNote?.trim() || null,
    notes: input.notes?.trim() || null,
    status: 'pending',
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
      createdAt: new Date().toISOString(),
    }
  }

  const rows = await readLocal()
  const row: Preorder = {
    id: `local-${Date.now()}`,
    ...values,
    createdAt: new Date().toISOString(),
  }
  rows.push(row)
  await writeLocal(rows)
  return row
}
