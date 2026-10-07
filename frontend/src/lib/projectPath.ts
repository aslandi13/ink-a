import { categorySlug } from './projectCategories'

export function projectPath(locale: string, project: { slug?: string | null; category?: string | null }): string {
  return project.category
    ? `/${locale}/projects/${categorySlug(project.category)}/${project.slug ?? ''}`
    : `/${locale}/projects/${project.slug ?? ''}`
}
