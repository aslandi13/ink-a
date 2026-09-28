import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useLocale } from '../lib/useLocale'

export default function NotFound() {
  const locale = useLocale()

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        className="font-serif text-[10rem] leading-none text-white/10 select-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      >
        404
      </motion.p>

      <motion.h1
        className="mt-4 font-serif text-3xl text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
      >
        {locale === 'ru' ? 'Страница не найдена' : 'Page not found'}
      </motion.h1>

      <motion.p
        className="mt-4 max-w-sm text-sm text-white/50"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease: [0.76, 0, 0.24, 1] }}
      >
        {locale === 'ru'
          ? 'Страница, которую вы ищете, не существует, или произошла ошибка. Пожалуйста, вернитесь на главную страницу.'
          : 'The page you are looking for does not exist or an error occurred. Please return to the home page.'}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
      >
        <Link
          to={`/${locale}`}
          className="mt-10 inline-block border border-white/30 px-8 py-3 text-sm text-white/70 transition-colors hover:border-white hover:text-white"
        >
          {locale === 'ru' ? '← На главную' : '← Back to home'}
        </Link>
      </motion.div>
    </section>
  )
}
