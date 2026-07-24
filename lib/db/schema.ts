import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const preorders = pgTable('preorders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  productSlug: text('product_slug').notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  pickupNote: text('pickup_note'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type Preorder = typeof preorders.$inferSelect
export type NewPreorder = typeof preorders.$inferInsert
