import type { Metadata } from 'next'
import { BakeBoard } from '@/components/bake-board'

export const metadata: Metadata = {
  title: 'Bake board',
  description: 'Advance preorder bake statuses.',
}

export default function BakePage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <h1 className="page-title">Bake board</h1>
        <p className="page-lead">
          Bakery only — advance each loaf through the pickup-day timeline.
        </p>
        <BakeBoard />
      </div>
    </main>
  )
}
