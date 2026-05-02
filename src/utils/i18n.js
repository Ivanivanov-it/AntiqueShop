export const locales = ['bg', 'en'];
export const defaultLocale = 'bg';

const copy = {
  bg: {
    nav: {
      categories: 'Категории',
      about: 'За нас',
      contact: 'Контакти',
      switchLabel: 'English',
      switchAria: 'Switch language to English',
    },
    seo: {
      siteName: 'Antique Shop',
      description: 'Подбрани антики, редки предмети и колекционерски обекти с история и характер.',
    },
    footer: {
      intro: 'Подбрани антики, редки предмети и обекти с характер за дома и колекцията.',
      categories: 'Категории',
      quickLinks: 'Бързи връзки',
      about: 'За нас',
      contactLink: 'Свържете се с нас',
      follow: 'Последвайте ни',
      terms: 'Условия',
      payment: 'Начини на плащане',
      delivery: 'Условия на доставка',
      returns: 'Връщане и замяна',
      contacts: 'Контакти',
      shopName: 'Антикварен магазин Берлин',
      shopText: 'Селекция, оценка и консултация за ценни предмети.',
      rights: 'All rights reserved.',
      tagline: 'Антики с история и характер.',
    },
  },
  en: {
    nav: {
      categories: 'Categories',
      about: 'About',
      contact: 'Contact',
      switchLabel: 'Български',
      switchAria: 'Switch language to Bulgarian',
    },
    seo: {
      siteName: 'Antique Shop',
      description: 'Curated antiques, rare objects, and collectible pieces with history and character.',
    },
    footer: {
      intro: 'Curated antiques, rare objects, and distinctive pieces for the home and collection.',
      categories: 'Categories',
      quickLinks: 'Quick links',
      about: 'About',
      contactLink: 'Contact us',
      follow: 'Follow us',
      terms: 'Terms',
      payment: 'Payment methods',
      delivery: 'Delivery terms',
      returns: 'Returns and exchanges',
      contacts: 'Contact',
      shopName: 'Antique Shop Berlin',
      shopText: 'Selection, appraisal, and consultation for valuable objects.',
      rights: 'All rights reserved.',
      tagline: 'Antiques with history and character.',
    },
  },
};

export const getLocale = (locale) => locales.includes(locale) ? locale : defaultLocale;
export const t = (locale) => copy[getLocale(locale)];

export const localizedPath = (locale, path = '/') => {
  const safeLocale = getLocale(locale);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${safeLocale}${cleanPath}`.replace(/\/$/, '') || `/${safeLocale}`;
};

export const stripLocaleFromPath = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  if (locales.includes(parts[0])) parts.shift();
  return `/${parts.join('/')}`.replace(/\/$/, '') || '/';
};

export const switchLocalePath = (pathname, nextLocale) => localizedPath(nextLocale, stripLocaleFromPath(pathname));

export const staticLocalePaths = () => locales.map((locale) => ({ params: { locale } }));

const itemTranslations = {
  en: {
    'графика': {
      title: 'Print',
      description: 'Graphic work / print.',
    },
    'книга': {
      title: 'Book',
      description: 'Antique or collectible book.',
    },
    'носия': {
      title: 'Traditional Folk Costume',
      description: 'Traditional garment.',
    },
    'порцелан': {
      title: 'Porcelain',
      description: 'Porcelain object.',
    },
    'северняшка-народна-носия': {
      title: 'Northern Bulgarian Folk Costume',
      description: 'Shirt: length 127 cm, sleeve 37 cm, shoulders 35 cm, chest 90 cm. Apron: 91/40 cm. Pishtimal: length 56 cm, waist 51 cm, unfolded width 330 cm. Only the garments are sold, without the jewelry. Not sold separately.',
    },
    'скулптура': {
      title: 'Sculpture',
      description: 'Sculpture.',
    },
    'слънчогледи': {
      title: 'Sunflowers',
      description: 'Sunflower painting.',
    },
    'часовник': {
      title: 'Watch',
      description: 'Watch.',
    },
    'часовници': {
      title: 'Clocks and Watches',
      description: 'Clocks and watches.',
    },
    'часовници222': {
      title: 'Table Clocks 222',
      description: 'Table clocks.',
    },
    'Порцеланови неща': {
      title: 'Porcelain Items',
      description: 'Porcelain items.',
    }
  },
};

export const getItemTitle = (item, locale = defaultLocale) => {
  return itemTranslations[locale]?.[item.id]?.title || item.data.title;
};

export const getItemDescription = (item, locale = defaultLocale) => {
  return itemTranslations[locale]?.[item.id]?.description || item.data.description;
};
