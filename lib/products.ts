export type Product = {
  slug: string
  name: string
  short: string
  description: string
  priceLabel: string
  image: string
  recipe: {
    yield: string
    time: string
    ingredients: string[]
    steps: string[]
  }
}

export const products: Product[] = [
  {
    slug: 'artisan-oval-loaf',
    name: 'Artisan oval loaf',
    short: 'Classic sourdough oval — open crumb, crisp crust.',
    description:
      'Our everyday table bread. Long ferment, blistered crust, and a tender open crumb that stands up to butter or soup.',
    priceLabel: '$10',
    image: '/images/artisan-oval-loaf.png',
    recipe: {
      yield: '1 oval loaf',
      time: 'About 24 hours with overnight ferment',
      ingredients: [
        '500g bread flour',
        '375g water',
        '100g active sourdough starter',
        '10g salt',
      ],
      steps: [
        'Mix flour and water; rest 30 minutes (autolyse).',
        'Add starter and salt; mix until cohesive.',
        'Bulk ferment with a few gentle folds over 4–5 hours.',
        'Shape into an oval, proof overnight cold.',
        'Score and bake hot until deep golden.',
      ],
    },
  },
  {
    slug: 'cheddar-jalapeno-oval',
    name: 'Cheddar & jalapeño oval',
    short: 'Same oval bake, sharp cheddar and jalapeño heat.',
    description:
      'The artisan oval with cubed cheddar and sliced jalapeño folded through. Melty pockets, gentle heat, big flavor.',
    priceLabel: '$12',
    image: '/images/cheddar-jalapeno-bread.png',
    recipe: {
      yield: '1 oval loaf',
      time: 'About 24 hours with overnight ferment',
      ingredients: [
        '500g bread flour',
        '375g water',
        '100g active sourdough starter',
        '10g salt',
        '150g sharp cheddar, cubed',
        '1–2 jalapeños, sliced',
      ],
      steps: [
        'Mix and ferment like the artisan oval.',
        'Laminate cheese and jalapeño during the final folds.',
        'Shape oval, cold proof overnight.',
        'Bake until crust is bronze and cheese edges crisp.',
      ],
    },
  },
  {
    slug: 'focaccia',
    name: 'Focaccia',
    short: 'Dimpled olive-oil focaccia — tear-and-share.',
    description:
      'A sheet of soft, olive-oil focaccia with a crisp bottom and airy crumb. Made for dipping, sandwiches, or tearing at the table.',
    priceLabel: '$14',
    image: '/images/focaccia.png',
    recipe: {
      yield: '1 sheet (about 9x13)',
      time: 'About 6–8 hours same day, or overnight cold',
      ingredients: [
        '500g bread flour',
        '400g water',
        '100g active sourdough starter',
        '10g salt',
        'Olive oil for pan and topping',
        'Flaky salt',
      ],
      steps: [
        'Mix a wet dough; rest and fold until airy.',
        'Oil a pan, stretch dough in, and dimple well.',
        'Proof until jiggly and full of bubbles.',
        'Drizzle oil, salt, and bake until golden.',
      ],
    },
  },
  {
    slug: 'sandwich-loaf',
    name: 'Sandwich loaf',
    short: 'Soft, even crumb — made for toast and sandwiches.',
    description:
      'A pan loaf with a finer crumb and softer crust. Slices clean for toast, grilled cheese, and weekday sandwiches.',
    priceLabel: '$9',
    image: '/images/sandwich-loaf.png',
    recipe: {
      yield: '1 pan loaf',
      time: 'About 8–12 hours',
      ingredients: [
        '450g bread flour',
        '50g whole wheat flour',
        '340g water',
        '100g active sourdough starter',
        '10g salt',
        '15g olive oil or butter',
      ],
      steps: [
        'Mix until smooth; bulk ferment with gentle folds.',
        'Shape into a tight log and place in a loaf pan.',
        'Proof until the dough crowns the pan.',
        'Bake covered briefly if you like, then uncover to finish.',
      ],
    },
  },
]

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}
