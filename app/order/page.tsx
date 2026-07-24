import type { Metadata } from 'next'
import { PreorderForm } from '@/components/preorder-form'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Preorder',
  description: `Submit a preorder with ${site.name}.`,
}

export default function OrderPage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <h1 className="page-title">Preorder</h1>
        <p className="page-lead">
          {site.preorder.cutoff}. {site.preorder.pickupDay}.{' '}
          {site.preorder.pickupLocation}.
        </p>
        <PreorderForm />
      </div>
    </main>
  )
}
