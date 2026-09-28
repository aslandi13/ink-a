import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import Layout from './components/Layout'
import SiteSettingsProvider from './components/SiteSettingsProvider'
import { DEFAULT_LOCALE, isLocale } from './lib/locale'
import About from './pages/About'
import Approach from './pages/Approach'
import Contacts from './pages/Contacts'
import Home from './pages/Home'
import Legal from './pages/Legal'
import NewsDetail from './pages/NewsDetail'
import NewsList from './pages/NewsList'
import NotFound from './pages/NotFound'
import ProjectDetail from './pages/ProjectDetail'
import Projects from './pages/Projects'

function LocaleGate() {
  const { locale } = useParams()

  if (!isLocale(locale)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />
  }

  return (
    <Layout>
      <Routes>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:slug" element={<ProjectDetail />} />
        <Route path="approach" element={<Approach />} />
        <Route path="news" element={<NewsList />} />
        <Route path="news/:slug" element={<NewsDetail />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="legal" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
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
        <Route path="/:locale/*" element={<LocaleGate />} />
      </Routes>
    </>
  )
}

export default App
