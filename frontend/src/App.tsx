import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import SiteSettingsProvider from './components/SiteSettingsProvider'
import { useEnabledLocales } from './lib/enabledLocales'
import { DEFAULT_PROJECT_CATEGORY, isProjectCategory } from './lib/projectCategories'
import { DEFAULT_LOCALE, isLocale } from './lib/locale'
import About from './pages/About'
import Approach from './pages/Approach'
import Contacts from './pages/Contacts'
import Home from './pages/Home'
import Legal from './pages/Legal'
import NewsDetail from './pages/NewsDetail'
import NewsList from './pages/NewsList'
import CustomPage from './pages/CustomPage'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'

const EditorPage = lazy(() => import('./editor/EditorPage'))

function ProjectsOrDetail() {
  const { slug } = useParams()
  return isProjectCategory(slug) ? <Projects /> : <ProjectDetail />
}

function LocaleGate() {
  const { locale } = useParams()
  const location = useLocation()
  const enabled = useEnabledLocales()

  if (!isLocale(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  }

  if (locale !== DEFAULT_LOCALE) {
    if (!enabled) return null
    if (!enabled.includes(locale)) {
      const rest = location.pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '')
      return <Navigate to={`/${DEFAULT_LOCALE}${rest}${location.search}`} replace />
    }
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<Navigate to={DEFAULT_PROJECT_CATEGORY} replace />} />
        <Route path="projects/:slug" element={<ProjectsOrDetail />} />
        <Route path="projects/:category/:slug" element={<ProjectDetail />} />
        <Route path="approach" element={<Approach />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<CustomPage />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <>
      <SiteSettingsProvider />
      <Routes>
        <Route path="/" element={<Navigate to={`/${DEFAULT_LOCALE}`} replace />} />
        <Route
          path="/editor/:slug"
          element={
            <Suspense fallback={null}>
              <EditorPage />
            </Suspense>
          }
        />
        <Route path="/:locale/*" element={<LocaleGate />} />
      </Routes>
    </>
  )
}

export default App
