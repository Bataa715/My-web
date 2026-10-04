import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { PATH, LESSON_BY_ID } from '../data/curriculum.js'
import { useStore } from '../state/store.jsx'
import { sfx } from '../lib/sound.js'

/**
 * Дасгалын горимд ашиглах дасгал бүр эх хичээлээ хамт зөөнө (srcKey).
 * Ингэснээр давтаж зөв хариулбал «Алдааны дэвтэр»-ээс арилна.
 */
function tagged(lesson, ex, i) {
  return {
    ...ex,
    srcKey: `${lesson.id}:${i}`,
    srcLesson: lesson.id,
    srcTitle: lesson.title,
    srcIndex: i,
  }
}

/** Санамсаргүй холимог дасгал бүхий түр хичээл угсарна */
function buildMix(pool, size, title, icon, subtitle) {
  const picked = []
  const copy = [...pool]
  while (picked.length < size && copy.length) {
    picked.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return {
    id: `mix-${Date.now()}`,
    kind: 'review',
    icon,
    title,
    subtitle,
    ephemeral: true,
    unit: { town: 'Дасгалын талбай', hue: 200 },
    teach: {
      lead: 'Энэ бол **дасгалын хичээл** — замын түгжээнд нөлөөлөхгүй, гэхдээ XP бүрэн олгоно.',
      sections: [
        {
          h: 'Хэрхэн ажиллах вэ',
          list: [
            `Санамсаргүй сонгосон **${picked.length} даалгавар**.`,
            'Зөв хариулсан асуулт **Алдааны дэвтрээс** арилна.',
            'Асуулт аль хичээлээс гарсныг мартсан бол **Дэвтэр** табаас тухайн хичээлээ бүтнээр нь уншиж болно.',
          ],
        },
      ],
    },
    exercises: picked,
  }
}

export default function Practice({ onOpen }) {
  const { state } = useStore()

  const doneLessons = useMemo(() => PATH.filter((l) => state.completed[l.id]), [state.completed])

  const quizPool = useMemo(
    () => doneLessons.flatMap((l) => l.exercises.map((e, i) => tagged(l, e, i)).filter((e) => e.t !== 'code')),
    [doneLessons],
  )

  const codePool = useMemo(
    () => doneLessons.flatMap((l) => l.exercises.map((e, i) => tagged(l, e, i)).filter((e) => e.t === 'code')),
    [doneLessons],
  )

  const mistakes = useMemo(
    () =>
      state.mistakes
        .map((m) => {
          const lesson = LESSON_BY_ID[m.lessonId]
          const ex = lesson?.exercises?.[m.exerciseIndex]
          return ex ? { ...m, ex: tagged(lesson, ex, m.exerciseIndex) } : null
        })
        .filter(Boolean),
    [state.mistakes],
  )

  const cards = [
    {
      id: 'mistakes',
      icon: '🩹',
      title: 'Алдааны дэвтэр',
      desc: mistakes.length ? `${mistakes.length} алдсан асуулт хүлээж байна` : 'Одоохондоо алдаа алга',
      disabled: mistakes.length === 0,
      build: () =>
        buildMix(mistakes.map((m) => m.ex), Math.min(12, mistakes.length), 'Алдааны дэвтэр', '🩹', 'Алдсан асуултууд'),
    },
    {
      id: 'mix',
      icon: '🎲',
      title: 'Холимог давталт',
      desc: quizPool.length ? `${quizPool.length} асуултаас 10-ыг санамсаргүй` : 'Эхлээд нэг хичээл дуусга',
      disabled: quizPool.length < 4,
      build: () => buildMix(quizPool, Math.min(10, quizPool.length), 'Холимог давталт', '🎲', 'Санамсаргүй асуултууд'),
    },
    {
      id: 'code',
      icon: '⌨️',
      title: 'Кодын дасгал',
      desc: codePool.length ? `${codePool.length} даалгаврыг дахин бич` : 'Эхлээд кодын зогсоол дуусга',
      disabled: codePool.length === 0,
      build: () => buildMix(codePool, Math.min(3, codePool.length), 'Кодын дасгал', '⌨️', 'Гараа халаа'),
    },
    {
      id: 'boss',
      icon: '👑',
      title: 'Шалгалтын бэлтгэл',
      desc: quizPool.length >= 8 ? '15 асуулт — эцсийн шалгалтын хэв маягаар' : 'Дор хаяж 8 асуулт нээгдсэн байх ёстой',
      disabled: quizPool.length < 8,
      build: () => buildMix(quizPool, Math.min(15, quizPool.length), 'Шалгалтын бэлтгэл', '👑', 'Хатуу горим'),
    },
  ]

  return (
    <div className="screen">
      <div className="eyebrow">Дасгал</div>
      <h1 className="h1">Давталтын талбай</h1>
      <p className="sub">
        Дуусгасан зогсоолуудаас асуулт татаж давтана. Явцын түгжээнд нөлөөлөхгүй ч XP бүрэн олгоно.
      </p>

      <div className="grid-2 mt-24">
        {cards.map((c, i) => (
          <motion.button
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card"
            style={{
              textAlign: 'left',
              opacity: c.disabled ? 0.45 : 1,
              cursor: c.disabled ? 'not-allowed' : 'pointer',
            }}
            disabled={c.disabled}
            onClick={() => {
              sfx.tap()
              onOpen(c.build())
            }}
          >
            <div style={{ fontSize: 32, lineHeight: 1 }}>{c.icon}</div>
            <div className="h2 mt-8" style={{ fontSize: 17 }}>
              {c.title}
            </div>
            <div className="sub" style={{ fontSize: 13 }}>
              {c.desc}
            </div>
          </motion.button>
        ))}
      </div>

      {mistakes.length > 0 && (
        <>
          <h2 className="h2 mt-32">Сүүлд алдсан</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mistakes.slice(0, 10).map((m) => (
              <div className="card-flat" key={m.key}>
                <div className="stop-kind">{m.lessonTitle}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4, marginTop: 2 }}>{m.q}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {doneLessons.length === 0 && (
        <div className="empty-state mt-24">
          <div className="e">🛣️</div>
          Эхлээд «Аялал» хэсгээс нэг зогсоол дуусга — дараа нь энд давтах зүйл гарч ирнэ.
        </div>
      )}
    </div>
  )
}
