'use client'

import { useState } from 'react'
import { products } from '@/lib/products'
import { Button } from '@/components/ui/button'

type Props = {
  defaultSlug?: string
}

export function PreorderForm({ defaultSlug }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState('')

  async function onSubmit(formData: FormData) {
    setStatus('loading')
    setMessage('')

    const payload = {
      customerName: String(formData.get('customerName') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      productSlug: String(formData.get('productSlug') || ''),
      quantity: Number(formData.get('quantity') || 1),
      pickupNote: String(formData.get('pickupNote') || ''),
      notes: String(formData.get('notes') || ''),
    }

    try {
      const res = await fetch('/api/preorders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { error?: string; message?: string }
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
        return
      }
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
        <Button type="button" variant="outline" onClick={() => setStatus('idle')}>
          Place another
        </Button>
      </div>
    )
  }

  return (
    <form
      className="preorder-form"
      action={onSubmit}
    >
      <label>
        Name
        <input name="customerName" required autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Phone <span className="optional">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label>
        Loaf
        <select name="productSlug" defaultValue={defaultSlug || products[0].slug} required>
          {products.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name} — {p.priceLabel}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input name="quantity" type="number" min={1} max={20} defaultValue={1} required />
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
