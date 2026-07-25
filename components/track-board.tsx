'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { BakeTimeline } from '@/components/bake-timeline'
import { Button, buttonVariants } from '@/components/ui/button'
import { buildBakeTimeline } from '@/lib/bake-status'
import type { Preorder } from '@/lib/preorders'
import { cn } from '@/lib/utils'

export function TrackBoard() {
  const { user, loading, getIdToken } = useAuth()
  const [rows, setRows] = useState<Preorder[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setBusy(false)
      return
    }

    async function load() {
      setBusy(true)
      setError('')
      try {
        const token = await getIdToken()
        const res = await fetch('/api/preorders', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = (await res.json()) as {
          error?: string
          preorders?: Preorder[]
        }
        if (!res.ok) {
          setError(data.error || 'Could not load preorders.')
          return
        }
        setRows(data.preorders || [])
      } catch {
        setError('Network error.')
      } finally {
        setBusy(false)
      }
    }

    void load()
  }, [user, loading, getIdToken])

  if (loading || busy) {
    return <p className="page-lead">Loading your loaves…</p>
  }

  if (!user) {
    return (
      <div className="form-success">
        <h3>Sign in to track pickup day</h3>
        <p>Your bake status is tied to your account.</p>
        <Link href="/login?next=/track" className={cn(buttonVariants({ size: 'lg' }))}>
          Sign in
        </Link>
      </div>
    )
  }

  if (error) return <p className="form-error">{error}</p>

  if (!rows.length) {
    return (
      <div className="form-success">
        <h3>No preorders yet</h3>
        <p>Place a preorder, then watch it move from oven to pickup.</p>
        <Link href="/shop" className={cn(buttonVariants({ size: 'lg' }))}>
          Shop loaves
        </Link>
      </div>
    )
  }

  return (
    <div className="track-list">
      {rows.map((row) => (
        <article key={row.id} className="track-card">
          <header>
            <h2>{row.productName}</h2>
            <p>
              Qty {row.quantity}
              {row.pickupNote ? ` · ${row.pickupNote}` : ''}
            </p>
          </header>
          <BakeTimeline steps={buildBakeTimeline(row.status, row.statusHistory)} />
        </article>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Refresh status
      </Button>
    </div>
  )
}
