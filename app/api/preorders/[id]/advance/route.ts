import { NextResponse } from 'next/server'
import { isBakeAdminEmail } from '@/lib/firebase-admin'
import { advancePreorderStatus } from '@/lib/preorders'
import { verifyRequestAuth } from '@/lib/verify-request-auth'

type Props = {
  params: Promise<{ id: string }>
}

export async function POST(_request: Request, { params }: Props) {
  const user = await verifyRequestAuth(_request)
  if (!user || !isBakeAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Bake admin only.' }, { status: 403 })
  }

  const { id } = await params
  const row = await advancePreorderStatus(id)
  if (!row) {
    return NextResponse.json({ error: 'Preorder not found.' }, { status: 404 })
  }

  return NextResponse.json({ ok: true, preorder: row })
}
