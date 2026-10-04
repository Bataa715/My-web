import u1 from './units/u1.js'
import u2 from './units/u2.js'
import u3 from './units/u3.js'
import u4 from './units/u4.js'
import u5 from './units/u5.js'
import u3b from './units/u3b.js'
import u5b from './units/u5b.js'
import u6 from './units/u6.js'
import u7 from './units/u7.js'
import u8 from './units/u8.js'
import u9 from './units/u9.js'
import u10 from './units/u10.js'
import u11 from './units/u11.js'
import u12 from './units/u12.js'
import u13 from './units/u13.js'
import u14 from './units/u14.js'
import u15 from './units/u15.js'
import u16 from './units/u16.js'
import u17 from './units/u17.js'
import u18 from './units/u18.js'
import u19 from './units/u19.js'
import u20 from './units/u20.js'

export const UNITS = [u1, u2, u3, u3b, u4, u5, u5b, u6, u7, u8, u9, u10, u11, u12, u13, u14, u15, u16, u17, u18, u19, u20]

// Хичээлүүдийг замын дараалалд нь тэгшлэн жагсаана
export const PATH = UNITS.flatMap((u, ui) =>
  u.lessons.map((l, li) => ({ ...l, unitId: u.id, unitIndex: ui, lessonIndex: li, unit: u })),
)

export const LESSON_BY_ID = Object.fromEntries(PATH.map((l) => [l.id, l]))

export const XP_PER_EXERCISE = 12
export const XP_LESSON_BONUS = { lesson: 20, code: 35, review: 25, boss: 120 }

export const LEVELS = [
  { min: 0, name: 'Сурагч жолооч', badge: '🛵' },
  { min: 250, name: 'Замын шинэхэн', badge: '🏍️' },
  { min: 600, name: 'Аялагч', badge: '🧭' },
  { min: 1100, name: 'Инженер дадлагажигч', badge: '🔧' },
  { min: 1800, name: 'Junior инженер', badge: '💻' },
  { min: 2700, name: 'Mid инженер', badge: '🛠️' },
  { min: 3800, name: 'Senior инженер', badge: '🏆' },
  { min: 5200, name: 'Архитектор', badge: '👑' },
  { min: 7000, name: 'Ахлах архитектор', badge: '🛰️' },
  { min: 9500, name: 'Инженерчлэлийн захирал', badge: '🧭' },
  { min: 12500, name: 'CTO', badge: '🌠' },
]

export function levelFor(xp) {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) idx = i
  const cur = LEVELS[idx]
  const next = LEVELS[idx + 1] || null
  const span = next ? next.min - cur.min : 1
  const into = next ? xp - cur.min : 1
  return { index: idx, ...cur, next, progress: next ? Math.min(1, into / span) : 1 }
}

export const ACHIEVEMENTS = [
  { id: 'first_ride', icon: '🎉', title: 'Мотор асав', desc: 'Эхний хичээлээ дуусга' },
  { id: 'coder', icon: '⌨️', title: 'Кодчин', desc: 'Эхний кодын даалгавраа дуусга' },
  { id: 'streak3', icon: '🔥', title: '3 өдрийн цуваа', desc: '3 өдөр дараалан суралц' },
  { id: 'streak7', icon: '🔥', title: 'Долоо хоног', desc: '7 өдөр дараалан суралц' },
  { id: 'perfect', icon: '💎', title: 'Төгс давалт', desc: 'Хичээлийг алдаагүй дуусга' },
  { id: 'combo10', icon: '⚡', title: '10 цуваа', desc: 'Нэг хичээлд 10 зөв дараалуулж хариул' },
  { id: 'unit1', icon: '🏁', title: 'Эхлэлийн буудал', desc: 'Нэгж 1-ийг дуусга' },
  { id: 'boss1', icon: '🛡️', title: 'Хяналтын цэг давав', desc: 'Эхний checkpoint-ыг дав' },
  { id: 'xp1000', icon: '🌟', title: '1000 XP', desc: 'Нийт 1000 XP цуглуул' },
  { id: 'module1', icon: '👑', title: 'Модуль 1 дуусгагч', desc: 'Модуль 1-ийн эцсийн шалгалтыг дав' },
  { id: 'unit7', icon: '🌐', title: 'Вэбийн хаалга', desc: 'Модуль 2-т орж, Нэгж 7-г дуусга' },
  { id: 'module2', icon: '🗼', title: 'Модуль 2 дуусгагч', desc: 'Модуль 2-ийн эцсийн шалгалтыг дав' },
  { id: 'module3', icon: '🧩', title: 'Модуль 3 дуусгагч', desc: 'Модуль 3-ийн эцсийн шалгалтыг дав' },
  { id: 'module4', icon: '🏛️', title: 'Модуль 4 дуусгагч', desc: 'Модуль 4-ийн эцсийн шалгалтыг дав' },
  { id: 'module5', icon: '⚖️', title: 'Модуль 5 дуусгагч', desc: 'Модуль 5-ийн эцсийн шалгалтыг дав' },
  { id: 'finish', icon: '🎓', title: 'Аяллын төгсгөл', desc: 'Курсийн эцсийн шалгалтыг дав' },
  { id: 'allcode', icon: '🤖', title: 'Бүх кодыг бичив', desc: 'Кодын бүх зогсоолыг дуусга' },
  { id: 'night', icon: '🌙', title: 'Шөнийн жолооч', desc: '00:00–05:00 цагт хичээл дуусга' },
]
