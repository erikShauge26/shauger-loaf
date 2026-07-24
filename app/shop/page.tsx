import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { products } from '@/lib/products'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Shop',
  description: `Preorder loaves from ${site.name}.`,
}

export default function ShopPage() {
  return (
    <main className="page-hero-space">
      <div className="shell section">
        <h1 className="page-title">Shop &amp; preorder</h1>
        <p className="page-lead">
          Choose a loaf, then submit a preorder. {site.preorder.cutoff}.{' '}
          {site.preorder.pickupDay}.
        </p>
        <div className="product-grid">
          {products.map((product) => (
            <Link key={product.slug} href={`/shop/${product.slug}`} className="product-link">
              <Image
                src={product.image}
                alt={product.name}
                width={800}
                height={600}
              />
              <h3>{product.name}</h3>
              <p>{product.short}</p>
              <span className="product-price">{product.priceLabel}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
