import type { Metadata } from 'next'
import { TrackBoard } from '@/components/track-board'

export const metadata: Metadata = {
  title: 'Track pickup',
  description: 'Follow your loaf from oven to pickup.',
}

export default function TrackPage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <h1 className="page-title">Pickup day tracker</h1>
        <p className="page-lead">
          Watch your preorder move through mixing, the oven, resting, and pickup.
        </p>
        <TrackBoard />
      </div>
    </main>
  )
}
