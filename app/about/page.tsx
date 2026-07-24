import type { Metadata } from 'next'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${site.name}.`,
}

export default function AboutPage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <h1 className="page-title">About {site.name}</h1>
        <p className="page-lead">
          We bake small-batch sourdough to order. No walk-in shelves — just four
          loaves, preordered for pickup when they are fresh.
        </p>
        <div className="split-note">
          <p>
            <strong>How it works</strong>
          </p>
          <p>1. Browse the shop and pick a loaf.</p>
          <p>2. Submit a preorder with your name and email.</p>
          <p>
            3. {site.preorder.cutoff}. Pick up {site.preorder.pickupDay.toLowerCase()}{' '}
            at {site.preorder.pickupLocation}.
          </p>
        </div>
        <p className="page-lead">
          Each product page includes the recipe for that loaf only — no separate
          recipe blog.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ size: 'lg' }))}>
          Shop loaves
        </Link>
      </div>
    </main>
  )
}
