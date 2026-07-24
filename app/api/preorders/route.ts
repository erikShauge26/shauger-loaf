import { NextResponse } from 'next/server'
import { getProduct } from '@/lib/products'
import { createPreorder } from '@/lib/preorders'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customerName?: string
      email?: string
      phone?: string
      productSlug?: string
      quantity?: number
      pickupNote?: string
      notes?: string
    }

    const customerName = body.customerName?.trim()
    const email = body.email?.trim()
    const productSlug = body.productSlug?.trim()
    const quantity = Number(body.quantity ?? 1)

    if (!customerName || !email || !productSlug) {
      return NextResponse.json(
        { error: 'Name, email, and product are required.' },
        { status: 400 },
      )
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
      customerName,
      email,
      phone: body.phone,
      productSlug: product.slug,
      productName: product.name,
      quantity,
      pickupNote: body.pickupNote,
      notes: body.notes,
    })

    return NextResponse.json({
      ok: true,
      id: row.id,
      message: 'Preorder received. We will confirm pickup details by email.',
    })
  } catch (error) {
    console.error('preorder failed', error)
    return NextResponse.json(
      { error: 'Could not save preorder. Please try again.' },
      { status: 500 },
    )
  }
}
