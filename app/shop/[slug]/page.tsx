import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PreorderForm } from '@/components/preorder-form'
import { buttonVariants } from '@/components/ui/button'
import { getProduct, products } from '@/lib/products'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.short,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  return (
    <main className="page-hero-space">
      <div className="shell section">
        <Link
          href="/shop"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          ← Back to shop
        </Link>
        <div className="product-layout" style={{ marginTop: '1rem' }}>
          <Image
            src={product.image}
            alt={product.name}
            width={1000}
            height={800}
            priority
          />
          <div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-lead">{product.description}</p>
            <p className="product-price" style={{ fontSize: '1.25rem' }}>
              {product.priceLabel}
            </p>
            <div className="split-note">
              <span>Preorder this loaf</span>
            </div>
            <PreorderForm defaultSlug={product.slug} />
          </div>
        </div>

        <section className="recipe" aria-labelledby="recipe-heading">
          <h2 id="recipe-heading">Recipe for this loaf</h2>
          <p className="page-lead">
            {product.recipe.yield} · {product.recipe.time}
          </p>
          <h3>Ingredients</h3>
          <ul>
            {product.recipe.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Method</h3>
          <ol>
            {product.recipe.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}
