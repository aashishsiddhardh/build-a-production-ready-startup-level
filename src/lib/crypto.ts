// Client-side cryptographic helpers built on the Web Crypto API.
//
// NOTE ON THREAT MODEL: in the standalone/local build there is no server, so
// credentials are salted + PBKDF2-hashed and stored locally. This protects
// against casual inspection but is NOT a substitute for server-side auth. The
// bundled FastAPI reference backend performs the same hashing server-side. The
// UI clearly frames local accounts as a private, on-device demo.

const ITERATIONS = 150_000

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return arr
}

export function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function uuid(): string {
  if ('randomUUID' in crypto) return crypto.randomUUID()
  return randomHex(16)
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return toHex(bits)
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const hash = await pbkdf2(password, saltBytes)
  return { hash, salt: toHex(saltBytes.buffer) }
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await pbkdf2(password, fromHex(salt))
  // Constant-time-ish comparison.
  if (computed.length !== hash.length) return false
  let diff = 0
  for (let i = 0; i < computed.length; i++) diff |= computed.charCodeAt(i) ^ hash.charCodeAt(i)
  return diff === 0
}
