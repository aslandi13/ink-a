/**
 * Centralised translations for static UI strings.
 * Only strings that are NOT managed via CMS (PageContent) go here.
 */

import type { Locale } from './locale'

type Dict = {
  nav: {
    home: string
    projects: string
    approach: string
    about: string
    news: string
    contacts: string
  }
  about: {
    tabs: {
      history: string
      team: string
      founder: string
    }
  }
  projects: {
    title: string
    categories: {
      all: string
      architecture: string
      engineering: string
      urbanism: string
      interior: string
    }
    empty: string
    loadMore: string
  }
  approach: {
    expertise: string
    categories: {
      architecture: string
      engineering: string
      urbanism: string
      interior: string
    }
  }
  news: {
    title: string
    loadMore: string
    otherNews: string
  }
  legal: {
    title: string
  }
  home: {
    keyProjects: string
    about: string
  }
  ui: {
    loading: string
    error: string
    notFound: string
    projectNotFound: string
    newsNotFound: string
    more: string
  }
}

const translations: Record<Locale, Dict> = {
  ru: {
    nav: {
      home: 'Главная',
      projects: 'Проекты',
      approach: 'Подход',
      about: 'О нас',
      news: 'Новости',
      contacts: 'Контакты',
    },
    about: {
      tabs: {
        history: 'История',
        team: 'Команда',
        founder: 'Об основателе',
      },
    },
    projects: {
      title: 'Проекты',
      categories: {
        all: 'Все',
        architecture: 'Архитектура',
        engineering: 'Рабочее проектирование',
        urbanism: 'Урбанистика и мастерпланирование',
        interior: 'Дизайн интерьера',
      },
      empty: 'Пока нет проектов в этой категории.',
      loadMore: 'Загрузить ещё',
    },
    approach: {
      expertise: 'Экспертиза',
      categories: {
        architecture: 'Архитектура',
        engineering: 'Рабочее проектирование',
        urbanism: 'Урбанистика и мастерпланирование',
        interior: 'Дизайн интерьера',
      },
    },
    news: {
      title: 'Новости',
      loadMore: 'Загрузить ещё',
      otherNews: 'Другие новости',
    },
    legal: {
      title: 'Правовая информация и условия использования',
    },
    home: {
      keyProjects: 'Ключевые проекты',
      about: 'О нас',
    },
    ui: {
      loading: 'Загрузка…',
      error: 'Не удалось загрузить данные. Попробуйте обновить страницу.',
      notFound: 'Страница не найдена',
      projectNotFound: 'Проект не найден',
      newsNotFound: 'Новость не найдена',
      more: 'Далее',
    },
  },

  kz: {
    nav: {
      home: 'Басты бет',
      projects: 'Жобалар',
      approach: 'Тәсіл',
      about: 'Біз туралы',
      news: 'Жаңалықтар',
      contacts: 'Байланыс',
    },
    about: {
      tabs: {
        history: 'Тарих',
        team: 'Команда',
        founder: 'Негізші туралы',
      },
    },
    projects: {
      title: 'Жобалар',
      categories: {
        all: 'Барлығы',
        architecture: 'Сәулет өнері',
        engineering: 'Жұмыс жобалауы',
        urbanism: 'Урбанистика',
        interior: 'Интерьер дизайны',
      },
      empty: 'Бұл санатта жобалар жоқ.',
      loadMore: 'Тағы жүктеу',
    },
    approach: {
      expertise: 'Тәжірибе',
      categories: {
        architecture: 'Сәулет өнері',
        engineering: 'Жұмыс жобалауы',
        urbanism: 'Урбанистика',
        interior: 'Интерьер дизайны',
      },
    },
    news: {
      title: 'Жаңалықтар',
      loadMore: 'Тағы жүктеу',
      otherNews: 'Басқа жаңалықтар',
    },
    legal: {
      title: 'Заңдық ақпарат және пайдалану шарттары',
    },
    home: {
      keyProjects: 'Негізгі жобалар',
      about: 'Біз туралы',
    },
    ui: {
      loading: 'Жүктелуде…',
      error: 'Деректерді жүктеу мүмкін болмады. Бетті жаңартып көріңіз.',
      notFound: 'Бет табылмады',
      projectNotFound: 'Жоба табылмады',
      newsNotFound: 'Жаңалық табылмады',
      more: 'Одан ары',
    },
  },

  en: {
    nav: {
      home: 'Home',
      projects: 'Projects',
      approach: 'Approach',
      about: 'About',
      news: 'News',
      contacts: 'Contacts',
    },
    about: {
      tabs: {
        history: 'History',
        team: 'Team',
        founder: 'About the Founder',
      },
    },
    projects: {
      title: 'Projects',
      categories: {
        all: 'All',
        architecture: 'Architecture',
        engineering: 'Engineering Design',
        urbanism: 'Urbanism & Masterplanning',
        interior: 'Interior Design',
      },
      empty: 'No projects in this category yet.',
      loadMore: 'Load more',
    },
    approach: {
      expertise: 'Expertise',
      categories: {
        architecture: 'Architecture',
        engineering: 'Engineering Design',
        urbanism: 'Urbanism & Masterplanning',
        interior: 'Interior Design',
      },
    },
    news: {
      title: 'News',
      loadMore: 'Load more',
      otherNews: 'Other news',
    },
    legal: {
      title: 'Legal information & Terms of use',
    },
    home: {
      keyProjects: 'Key Projects',
      about: 'About us',
    },
    ui: {
      loading: 'Loading…',
      error: 'Failed to load data. Please refresh the page.',
      notFound: 'Page not found',
      projectNotFound: 'Project not found',
      newsNotFound: 'News article not found',
      more: 'See More',
    },
  },
}

export function t(locale: Locale): Dict {
  return translations[locale]
}
