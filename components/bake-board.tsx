'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { BAKE_STEPS, nextBakeStatus } from '@/lib/bake-status'
import type { Preorder } from '@/lib/preorders'
import { cn } from '@/lib/utils'

export function BakeBoard() {
  const { user, loading, getIdToken } = useAuth()
  const [rows, setRows] = useState<Preorder[]>([])
  const [admin, setAdmin] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')

  async function load() {
    const token = await getIdToken()
    if (!token) return
    const res = await fetch('/api/preorders?scope=all', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = (await res.json()) as {
      error?: string
      preorders?: Preorder[]
      admin?: boolean
    }
    if (!res.ok) {
      setError(data.error || 'Could not load bake board.')
      return
    }
    setAdmin(Boolean(data.admin))
    setRows(data.preorders || [])
  }

  useEffect(() => {
    if (loading || !user) return
    void load().catch(() => setError('Network error.'))
  }, [user, loading])

  if (loading) return <p className="page-lead">Loading…</p>

  if (!user) {
    return (
      <Link href="/login?next=/bake" className={cn(buttonVariants({ size: 'lg' }))}>
        Sign in
      </Link>
    )
  }

  if (error) return <p className="form-error">{error}</p>
  if (!admin) {
    return (
      <p className="page-lead">
        This page is for the bakery only. Add your email to BAKE_ADMIN_EMAILS.
      </p>
    )
  }

  async function advance(id: string) {
    setBusyId(id)
    try {
      const token = await getIdToken()
      const res = await fetch(`/api/preorders/${id}/advance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error || 'Could not advance status.')
        return
      }
      await load()
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="track-list">
      {rows.map((row) => {
        const next = nextBakeStatus(row.status)
        const label =
          BAKE_STEPS.find((step) => step.id === row.status)?.label || row.status
        return (
          <article key={row.id} className="track-card">
            <header>
              <h2>{row.productName}</h2>
              <p>
                {row.customerName} · {row.email} · Qty {row.quantity}
              </p>
              <p className="product-price">{label}</p>
            </header>
            {next ? (
              <Button
                type="button"
                size="lg"
                disabled={busyId === row.id}
                onClick={() => void advance(row.id)}
              >
                {busyId === row.id
                  ? 'Updating…'
                  : `Mark ${BAKE_STEPS.find((s) => s.id === next)?.label}`}
              </Button>
            ) : (
              <p className="optional">Complete</p>
            )}
          </article>
        )
      })}
      {!rows.length ? <p className="page-lead">No preorders yet.</p> : null}
    </div>
  )
}
