export const PROJECT_CATEGORY_IDS = ['architecture', 'engineering', 'urbanism', 'interior'] as const

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY_IDS[0]

export const PROJECTS_PER_PAGE = 100

const CATEGORY_SLUGS: Record<string, string> = {
  architecture: 'architecture',
  engineering: 'engineering',
  urbanism: 'urban-planning',
  interior: 'public-interior',
}

export function categorySlug(category: string): string {
  return CATEGORY_SLUGS[category] ?? category
}

export function categoryFromSlug(value: string | undefined): string | null {
  if (!value) return null
  if (value in CATEGORY_SLUGS) return value
  return Object.keys(CATEGORY_SLUGS).find((key) => CATEGORY_SLUGS[key] === value) ?? null
}

export function isProjectCategory(value: string | undefined): boolean {
  return categoryFromSlug(value) !== null
}
