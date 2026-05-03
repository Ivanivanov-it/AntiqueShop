export const categories = [
  { 
    slug: 'antikvarni-chasovnici', 
    name: 'Антикварни часовници', 
    description: 'Джобни, стенни, ръчни и настолни часовници.',
    subcategories: [
      { slug: 'dzhobni-chasovnici', name: 'Джобни часновници' },
      { slug: 'stenni-chasovnici', name: 'Стенни часовници' },
      { slug: 'rachni-chasovnici', name: 'Ръчни часовници' },
      { slug: 'nastolni-chasovnici', name: 'Настолни часовници' },
      { slug: 'drugi', name: 'Други' }
    ],
    image: '/images/categories/category-watches-bright.webp'
  },
  { 
    slug: 'porcelan', 
    name: 'Порцелан', 
    description: 'Керамика и порцелан.',
    subcategories: [],
    image: '/images/categories/category-porcelain-bright.webp'
  },
  { 
    slug: 'starinni-bizhuta', 
    name: 'Старинни бижута', 
    description: 'Етнографски накити и страринни бижута.',
    subcategories: [],
    image: '/images/categories/category-jewelry-bright.webp'
  },
  { 
    slug: 'izobrazitelno-izkustvo', 
    name: 'Изобразително изкуство', 
    description: 'Оригинални картини и редки литографии.',
    subcategories: [
      { slug: 'jivopis', name: 'Живопис' },
      { slug: 'grafika', name: 'Графика' },
      { slug: 'skulptura', name: 'Скулптура' }
    ],
    image: '/images/categories/category-art.webp'
  },
  { 
    slug: 'kolektsionerski-predmeti', 
    name: 'Колекционерски предмети', 
    description: 'Уникални предмети, които разказват история.',
    subcategories: [
      { slug: 'moneti', name: 'Монети' },
      { slug: 'medali-i-ordeni', name: 'Медали и ордени' },
      { slug: 'filatelia', name: 'Филателия' },
      { slug: 'znachki', name: 'Значки' },
      { slug: 'detski-igrachki', name: 'Детски играчки' },
      { slug: 'drugi', name: 'Други' }
    ],
    image: '/images/categories/category-collections-bright.webp'
  },
  { 
    slug: 'etnika-i-folklor', 
    name: 'Етника и Фолклор', 
    description: 'Исторически облекла и аксесоари.',
     subcategories: [
      { slug: 'obleklo', name: 'Облекло' },
      { slug: 'nakiti', name: 'Накити' },
      { slug: 'drugi', name: 'Други' }
    ],
    image: '/images/categories/category-folklor.webp'
  },
  { 
    slug: 'suveniri-i-podaratsi', 
    name: 'Сувенири и Подараци', 
    description: 'Сувенири и подаръци с антикварна стойност.',
    subcategories: [],
    image: '/images/categories/category-gifts-bright.webp'
  },
  { 
    slug: 'knigi', 
    name: 'Книги', 
    description: 'Книги',
    subcategories: [],
    image: '/images/categories/category-books.webp' },
  { 
    slug: 'voenni-predmeti', 
    name: 'Военни предмети', 
    description: 'Антикварни военни предмети и артефакти.',
    subcategories: [],
    image: '/images/categories/category-military.webp'
  }
];

export const getSlug = (category) => {
  return category.slug;
};

const localizedCategories = {
  bg: {},
  en: {
    'antikvarni-chasovnici': {
      name: 'Antique clocks and watches',
      description: 'Pocket watches, wall clocks, wristwatches, and mantel clocks.',
      subcategories: {
        'dzhobni-chasovnici': 'Pocket watches',
        'stenni-chasovnici': 'Wall clocks',
        'rachni-chasovnici': 'Wristwatches',
        'nastolni-chasovnici': 'Mantel and table clocks',
        'drugi': 'Other',
      },
    },
    porcelan: {
      name: 'Porcelain',
      description: 'Ceramic and porcelain objects.',
    },
    'starinni-bizhuta': {
      name: 'Antique jewelry',
      description: 'Ethnographic adornments and antique jewelry.',
    },
    'izobrazitelno-izkustvo': {
      name: 'Fine art',
      description: 'Original paintings and rare lithographs.',
      subcategories: {
        jivopis: 'Paintings',
        grafika: 'Prints and graphic works',
        skulptura: 'Sculpture',
      },
    },
    'kolektsionerski-predmeti': {
      name: 'Collectibles',
      description: 'Distinctive objects with a story to tell.',
      subcategories: {
        moneti: 'Coins',
        'medali-i-ordeni': 'Medals and orders',
        filatelia: 'Philately',
        znachki: 'Badges',
        'detski-igrachki': 'Vintage toys',
        drugi: 'Other',
      },
    },
    'etnika-i-folklor': {
      name: 'Ethnographic and folk objects',
      description: 'Historical garments and traditional accessories.',
      subcategories: {
        obleklo: 'Traditional garments',
        nakiti: 'Adornment',
        drugi: 'Other',
      },
    },
    'suveniri-i-podaratsi': {
      name: 'Souvenirs and gifts',
      description: 'Souvenirs and gifts with antique value.',
    },
    knigi: {
      name: 'Books',
      description: 'Books and printed works.',
    },
    'voenni-predmeti': {
      name: 'Military antiques',
      description: 'Antique military objects and artifacts.',
    },
  },
};

const localizedSubcategoryNames = {
  en: {
    'Джобни часовници': 'Pocket watches',
    'Джобни часновници': 'Pocket watches',
    'Стенни часовници': 'Wall clocks',
    'Ръчни часовници': 'Wristwatches',
    'Настолни часовници': 'Mantel and table clocks',
    'Часовник': 'Clock or watch',
    'Живопис': 'Paintings',
    'Графика': 'Prints and graphic works',
    'Скулптура': 'Sculpture',
    'Облекло': 'Traditional garments',
    'Накити': 'Adornment',
    'Други': 'Other',
  },
};

export const getCategoryName = (category, locale = 'bg') => {
  return localizedCategories[locale]?.[category.slug]?.name || category.name;
};

export const getCategoryDescription = (category, locale = 'bg') => {
  return localizedCategories[locale]?.[category.slug]?.description || category.description;
};

export const getSubcategoryName = (category, subcategoryName, locale = 'bg') => {
  const subcategory = category?.subcategories?.find((item) => item.name === subcategoryName);
  if (!subcategory) return localizedSubcategoryNames[locale]?.[subcategoryName] || subcategoryName;
  return localizedCategories[locale]?.[category.slug]?.subcategories?.[subcategory.slug] || localizedSubcategoryNames[locale]?.[subcategoryName] || subcategoryName;
};

export const getSubcategoryNameByCategoryName = (categoryName, subcategoryName, locale = 'bg') => {
  const category = categories.find((item) => item.name === categoryName);
  return getSubcategoryName(category, subcategoryName, locale);
};
