import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env.local')

function loadEnv() {
  if (!existsSync(envPath)) throw new Error('Missing .env.local')
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const i = line.indexOf('=')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnv()

const email = 'demo@shaugerloaf.test'
const password = 'DemoLoaf123!'
const displayName = 'Alex Demo'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
const db = getFirestore()

let user
try {
  user = await auth.getUserByEmail(email)
  await auth.updateUser(user.uid, { password, displayName, emailVerified: true })
  console.log('Updated existing demo user', user.uid)
} catch {
  user = await auth.createUser({
    email,
    password,
    displayName,
    emailVerified: true,
  })
  console.log('Created demo user', user.uid)
}

const now = Date.now()
const hours = (h) => new Date(now - h * 3600_000).toISOString()

const statusHistory = {
  received: hours(30),
  mixing: hours(18),
  in_the_oven: hours(5),
  resting: hours(2),
  awaiting_pickup: hours(0.5),
}

const existing = await db
  .collection('preorders')
  .where('userId', '==', user.uid)
  .where('notes', '==', 'Demo order — leave on the porch bench if I’m a minute late.')
  .limit(1)
  .get()

let orderId
if (!existing.empty) {
  orderId = existing.docs[0].id
  await existing.docs[0].ref.set(
    {
      customerName: displayName,
      email,
      phone: '555-014-2088',
      productSlug: 'cheddar-jalapeno-oval',
      productName: 'Cheddar & jalapeño oval',
      quantity: 2,
      pickupNote: 'Saturday 10–11am window',
      notes: 'Demo order — leave on the porch bench if I’m a minute late.',
      status: 'awaiting_pickup',
      statusHistory,
      userId: user.uid,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  )
  console.log('Updated demo preorder', orderId)
} else {
  const ref = await db.collection('preorders').add({
    userId: user.uid,
    customerName: displayName,
    email,
    phone: '555-014-2088',
    productSlug: 'cheddar-jalapeno-oval',
    productName: 'Cheddar & jalapeño oval',
    quantity: 2,
    pickupNote: 'Saturday 10–11am window',
    notes: 'Demo order — leave on the porch bench if I’m a minute late.',
    status: 'awaiting_pickup',
    statusHistory,
    createdAt: FieldValue.serverTimestamp(),
  })
  orderId = ref.id
  console.log('Created demo preorder', orderId)
}

console.log(
  JSON.stringify(
    {
      email,
      password,
      name: displayName,
      orderId,
      status: 'awaiting_pickup',
      trackUrl: 'http://localhost:3000/track',
    },
    null,
    2,
  ),
)
