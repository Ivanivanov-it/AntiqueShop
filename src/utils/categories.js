export const categories = [
  { slug: 'antikvarni-chasovnici', name: 'Антикварни часовници', description: 'Джобни, стенни, ръчни и настолни часовници.' },
  { slug: 'porcelan', name: 'Порцелан', description: 'Стари изделия от порцелан и керамика.' },
  { slug: 'starinni-bizhuta', name: 'Старинни бижута', description: 'Етнографски накити и страринни бижута.' },
  { slug: 'izobrazitelno-izkustvo', name: 'Изобразително изкуство', description: 'Оригинални картини и редки литографии.' },
  { slug: 'kolektsionerski-predmeti', name: 'Колекционерски предмети', description: 'Уникални предмети, които разказват история.' },
  { slug: 'etnika-i-folklor', name: 'Етника и Фолклор', description: 'Исторически облекла и аксесоари.' },
  { slug: 'suveniri-i-podaratsi', name: 'Сувенири и Подараци', description: 'Сувенири и подаръци с антикварна стойност.' },
  { slug: 'instrumenti-i-nozhove', name: 'Инструменти и Ножове', description: 'Антикварни инструменти и ножове с колекционерска стойност.' },
  { slug: 'stari-uredi-i-aparati', name: 'Стари Уреди и Апарати', description: 'Антикварни уреди и апарати с историческа стойност.' },
  { slug: 'voenni-predmeti', name: 'Военни предмети', description: 'Антикварни военни предмети и артефакти.' }
];

export const getSlug = (category) => {
  return category.slug;
};
