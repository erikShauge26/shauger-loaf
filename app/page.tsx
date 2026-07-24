import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { products } from '@/lib/products'
import { site } from '@/lib/site'
import { cn } from '@/lib/utils'

export default function HomePage() {
  return (
    <main>
      <section className="hero" aria-label="Shauger Loaf hero">
        <Image
          src="/images/hero-bread.png"
          alt="Fresh sourdough loaves from Shauger Loaf"
          fill
          priority
          className="hero-media"
          sizes="100vw"
        />
        <div className="hero-copy">
          <h1 className="hero-brand">{site.name}</h1>
          <p className="hero-line">{site.tagline}</p>
          <div className="hero-actions">
            <Link href="/shop" className={cn(buttonVariants({ size: 'lg' }))}>
              Shop &amp; preorder
            </Link>
            <Link
              href="/about"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>This week&apos;s bake</h2>
          <p className="section-lead">
            Four loaves only. Preorder what you want — recipes live on each product page.
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
      </section>
    </main>
  )
}
