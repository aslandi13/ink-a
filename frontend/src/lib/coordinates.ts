function axis(value: string | null | undefined, positive: string, negative: string, limit: number): string | null {
  const number = Number(String(value ?? '').trim().replace(',', '.'))
  if (!String(value ?? '').trim() || !Number.isFinite(number) || Math.abs(number) > limit) return null
  const digits = String(value).trim().replace(',', '.').replace(/^-/, '')
  return `${digits}° ${number < 0 ? negative : positive}`
}

export function formatCoordinates(latitude: string | null | undefined, longitude: string | null | undefined): string | null {
  const lat = axis(latitude, 'N', 'S', 90)
  const lng = axis(longitude, 'E', 'W', 180)
  return lat && lng ? `${lat}, ${lng}` : null
}
