import type { ProjectListItem } from '../api/content'

const previews = new Map<string, ProjectListItem>()

export function rememberProjects(projects: ProjectListItem[]) {
  projects.forEach((project) => previews.set(`${project.category}/${project.slug}`, project))
}

export function projectPreview(category: string | null | undefined, slug: string | undefined): ProjectListItem | null {
  if (!slug) return null
  if (category) return previews.get(`${category}/${slug}`) ?? null
  for (const project of previews.values()) if (project.slug === slug) return project
  return null
}

export function preloadImage(src: string | null | undefined) {
  if (!src) return
  const image = new Image()
  image.decoding = 'async'
  image.src = src
}
