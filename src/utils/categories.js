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
    ]
  },
  { 
    slug: 'porcelan', 
    name: 'Порцелан', 
    description: 'Стари изделия от порцелан и керамика.',
    subcategories: []
  },
  { 
    slug: 'starinni-bizhuta', 
    name: 'Старинни бижута', 
    description: 'Етнографски накити и страринни бижута.',
    subcategories: []
  },
  { 
    slug: 'izobrazitelno-izkustvo', 
    name: 'Изобразително изкуство', 
    description: 'Оригинални картини и редки литографии.',
    subcategories: [
      { slug: 'jivopis', name: 'Живопис' },
      { slug: 'grafika', name: 'Графика' },
      { slug: 'skulptura', name: 'Скулптура' }
    ]
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
      { slug: 'drugi', name: 'Други' }
    ]
  },
  { 
    slug: 'etnika-i-folklor', 
    name: 'Етника и Фолклор', 
    description: 'Исторически облекла и аксесоари.',
     subcategories: [
      { slug: 'obleklo', name: 'Облекло' },
      { slug: 'nakiti', name: 'Накити' },
      { slug: 'drugi', name: 'Други' }
    ]
  },
  { 
    slug: 'suveniri-i-podaratsi', 
    name: 'Сувенири и Подараци', 
    description: 'Сувенири и подаръци с антикварна стойност.',
    subcategories: []
  },
  { 
    slug: 'knigi', 
    name: 'Книги', 
    description: 'Книги',
    subcategories: [] },
  { 
    slug: 'voenni-predmeti', 
    name: 'Военни предмети', 
    description: 'Антикварни военни предмети и артефакти.',
    subcategories: []
  }
];

export const getSlug = (category) => {
  return category.slug;
};
