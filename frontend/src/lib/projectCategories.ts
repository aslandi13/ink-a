export const PROJECT_CATEGORY_IDS = ['architecture', 'engineering', 'urbanism', 'interior'] as const

export const DEFAULT_PROJECT_CATEGORY = PROJECT_CATEGORY_IDS[0]

export function isProjectCategory(value: string | undefined): boolean {
  return !!value && (PROJECT_CATEGORY_IDS as readonly string[]).includes(value)
}

export const PROJECTS_PER_PAGE = 100
