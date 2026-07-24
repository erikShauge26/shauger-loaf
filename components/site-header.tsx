import Link from 'next/link'
import { site } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          {site.name}
        </Link>
        <nav className="nav" aria-label="Primary">
          <Link href="/shop">Shop</Link>
          <Link href="/order">Preorder</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
    </header>
  )
}
