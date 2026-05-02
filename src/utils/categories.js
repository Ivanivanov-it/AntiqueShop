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
    image: '/images/categories/category-watches.webp'
  },
  { 
    slug: 'porcelan', 
    name: 'Порцелан', 
    description: 'Керамика и порцелан.',
    subcategories: [],
    image: '/images/categories/category-porcelain.webp'
  },
  { 
    slug: 'starinni-bizhuta', 
    name: 'Старинни бижута', 
    description: 'Етнографски накити и страринни бижута.',
    subcategories: [],
    image: '/images/categories/category-jewelry.webp'
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
    image: '/images/categories/category-collections.webp'
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
    image: '/images/categories/category-gifts.webp'
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
