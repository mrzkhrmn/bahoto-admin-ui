export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return true

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(atob(padded)) as { exp?: number }
    if (typeof payload.exp !== 'number') return true

    return payload.exp * 1000 <= Date.now() + skewSeconds * 1000
  } catch {
    return true
  }
}
