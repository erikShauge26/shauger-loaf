'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { Button, buttonVariants } from '@/components/ui/button'
import { products } from '@/lib/products'
import { cn } from '@/lib/utils'

type Props = {
  defaultSlug?: string
}

export function PreorderForm({ defaultSlug }: Props) {
  const { user, loading, getIdToken } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState('')
  const [orderId, setOrderId] = useState('')

  if (loading) {
    return <p className="page-lead">Checking sign-in…</p>
  }

  if (!user) {
    return (
      <div className="form-success">
        <h3>Sign in to preorder</h3>
        <p>Preorders are tied to your account so you can track pickup day.</p>
        <Link href="/login?next=/order" className={cn(buttonVariants({ size: 'lg' }))}>
          Sign in
        </Link>
      </div>
    )
  }

  async function onSubmit(formData: FormData) {
    setStatus('loading')
    setMessage('')

    const token = await getIdToken()
    if (!token) {
      setStatus('error')
      setMessage('Please sign in again.')
      return
    }

    const payload = {
      customerName: String(formData.get('customerName') || ''),
      phone: String(formData.get('phone') || ''),
      productSlug: String(formData.get('productSlug') || ''),
      quantity: Number(formData.get('quantity') || 1),
      pickupNote: String(formData.get('pickupNote') || ''),
      notes: String(formData.get('notes') || ''),
    }

    try {
      const res = await fetch('/api/preorders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        error?: string
        message?: string
        id?: string
      }
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
        return
      }
      setOrderId(data.id || '')
      setStatus('done')
      setMessage(data.message || 'Preorder received.')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className="form-success" role="status">
        <h3>You are on the list</h3>
        <p>{message}</p>
        {orderId ? <p className="optional">Order {orderId}</p> : null}
        <Link href="/track" className={cn(buttonVariants({ size: 'lg' }))}>
          Track pickup day
        </Link>
      </div>
    )
  }

  return (
    <form className="preorder-form" action={onSubmit}>
      <label>
        Name
        <input
          name="customerName"
          required
          autoComplete="name"
          defaultValue={user.displayName || ''}
        />
      </label>
      <p className="optional">Signed in as {user.email}</p>
      <label>
        Phone <span className="optional">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        Loaf
        <select
          name="productSlug"
          defaultValue={defaultSlug || products[0].slug}
          required
        >
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} — {p.priceLabel}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          name="quantity"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
          required
        />
      </label>
      <label>
        Pickup note <span className="optional">(optional)</span>
        <input name="pickupNote" placeholder="Preferred Saturday window" />
      </label>
      <label>
        Notes <span className="optional">(optional)</span>
        <textarea name="notes" rows={3} placeholder="Allergies, gift note, etc." />
      </label>
      {status === 'error' ? <p className="form-error">{message}</p> : null}
      <Button type="submit" size="lg" disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending…' : 'Submit preorder'}
      </Button>
    </form>
  )
}
