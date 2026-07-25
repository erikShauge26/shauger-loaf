import { NextResponse } from 'next/server'
import { getProduct } from '@/lib/products'
import {
  createPreorder,
  listAllPreorders,
  listPreordersForUser,
} from '@/lib/preorders'
import { isBakeAdminEmail } from '@/lib/firebase-admin'
import { verifyRequestAuth } from '@/lib/verify-request-auth'

export async function GET(request: Request) {
  const user = await verifyRequestAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const admin = isBakeAdminEmail(user.email)
  const scope = new URL(request.url).searchParams.get('scope')
  const rows =
    admin && scope === 'all'
      ? await listAllPreorders()
      : await listPreordersForUser(user.uid)

  return NextResponse.json({ preorders: rows, admin })
}

export async function POST(request: Request) {
  try {
    const user = await verifyRequestAuth(request)
    if (!user?.email) {
      return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
    }

    const body = (await request.json()) as {
      customerName?: string
      phone?: string
      productSlug?: string
      quantity?: number
      pickupNote?: string
      notes?: string
    }

    const customerName = body.customerName?.trim() || user.name || 'Customer'
    const productSlug = body.productSlug?.trim()
    const quantity = Number(body.quantity ?? 1)

    if (!productSlug) {
      return NextResponse.json({ error: 'Product is required.' }, { status: 400 })
    }

    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 20.' },
        { status: 400 },
      )
    }

    const product = getProduct(productSlug)
    if (!product) {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 })
    }

    const row = await createPreorder({
      userId: user.uid,
      customerName,
      email: user.email,
      phone: body.phone,
      productSlug: product.slug,
      productName: product.name,
      quantity,
      pickupNote: body.pickupNote,
      notes: body.notes,
    })

    return NextResponse.json({
      ok: true,
      id: String(row.id),
      message: 'Preorder received. Track it on the pickup day page.',
    })
  } catch (error) {
    console.error('preorder failed', error)
    return NextResponse.json(
      { error: 'Could not save preorder. Please try again.' },
      { status: 500 },
    )
  }
}
