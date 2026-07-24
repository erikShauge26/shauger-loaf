import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { getDb, hasDatabase } from '@/lib/db'
import { preorders, type NewPreorder, type Preorder } from '@/lib/db/schema'

const localFile = path.join(process.cwd(), 'data', 'preorders.json')

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
  const values: NewPreorder = {
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

  if (hasDatabase()) {
    const db = getDb()
    const [row] = await db.insert(preorders).values(values).returning()
    return row
  }

  const rows = await readLocal()
  const row: Preorder = {
    id: rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1,
    customerName: values.customerName!,
    email: values.email!,
    phone: values.phone ?? null,
    productSlug: values.productSlug!,
    productName: values.productName!,
    quantity: values.quantity ?? 1,
    pickupNote: values.pickupNote ?? null,
    notes: values.notes ?? null,
    status: 'pending',
    createdAt: new Date(),
  }
  rows.push(row)
  await writeLocal(rows)
  return row
}
