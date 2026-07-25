import Link from 'next/link'
import { AuthMenu } from '@/components/auth-menu'
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
          <Link href="/track">Track</Link>
          <Link href="/about">About</Link>
          <AuthMenu />
        </nav>
      </div>
    </header>
  )
}
