import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { UNITS } from '../data/curriculum.js'
import { GLOSSARY } from '../data/glossary.js'
import { useStore } from '../state/store.jsx'
import LessonReader from './LessonReader.jsx'
import { sfx } from '../lib/sound.js'

/* --------------------------------------------------------------- Хичээлүүд */

function Notes() {
  const { state } = useStore()
  const [open, setOpen] = useState(null)

  return (
    <>
      <p className="sub">Үзсэн хичээл бүрийн бүрэн эх. Шалгалтын өмнө гүйлгэж уншихад тохиромжтой.</p>

      {UNITS.map((unit) => (
        <section key={unit.id} className="mt-24">
          <div className="row" style={{ gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{unit.icon}</span>
            <h2 className="h2" style={{ margin: 0, fontSize: 17 }}>
              {unit.town}
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unit.lessons.map((lesson) => {
              const done = Boolean(state.completed[lesson.id])
              const isOpen = open === lesson.id
              return (
                <div key={lesson.id} className="card-flat" style={{ opacity: done ? 1 : 0.5, padding: 0, overflow: 'hidden' }}>
                  <button
                    style={{ width: '100%', textAlign: 'left', padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 11 }}
                    onClick={() => {
                      if (!done) {
                        sfx.wrong()
                        return
                      }
                      sfx.tap()
                      setOpen(isOpen ? null : lesson.id)
                    }}
                  >
                    <span style={{ fontSize: 21 }}>{done ? lesson.icon : '🔒'}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.3 }}>{lesson.title}</div>
                      <div className="stop-sub" style={{ fontSize: 12.5 }}>
                        {done ? lesson.subtitle : 'Дуусгасны дараа нээгдэнэ'}
                      </div>
                    </span>
                    {done && <span className="faint">{isOpen ? '▲' : '▼'}</span>}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.24 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '4px 15px 18px' }}>
                          <LessonReader lesson={{ ...lesson, unit }} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </>
  )
}

/* ------------------------------------------------------------------ Толь */

const MODULES = ['Бүгд', 'Модуль 1', 'Модуль 2', 'Модуль 3', 'Модуль 4', 'Модуль 5']

function Glossary() {
  const [q, setQ] = useState('')
  const [mod, setMod] = useState('Бүгд')

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return GLOSSARY.filter((g) => {
      if (mod !== 'Бүгд' && g.m !== mod) return false
      if (!needle) return true
      return g.t.toLowerCase().includes(needle) || g.d.toLowerCase().includes(needle)
    })
  }, [q, mod])

  return (
    <>
      <p className="sub">
        Курсийн {GLOSSARY.length} нэр томьёо. Хайж эсвэл модулиар шүүж, тодорхойлолтыг эх хэлбэрээр нь унш.
      </p>

      <input
        className="search"
        value={q}
        placeholder="🔎 Нэр томьёо эсвэл түлхүүр үг хайх…"
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="row wrap mt-12" style={{ gap: 7 }}>
        {MODULES.map((m) => (
          <button
            key={m}
            className={`pill${mod === m ? ' amber' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              sfx.tap()
              setMod(m)
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="row mt-12" style={{ justifyContent: 'space-between' }}>
        <span className="eyebrow">{shown.length} нэр томьёо</span>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">
          <div className="e">🔍</div>
          Тохирох нэр томьёо олдсонгүй.
        </div>
      ) : (
        <div className="terms mt-8">
          {shown.map((g) => (
            <div className="term" key={g.t}>
              <div className="term-name">{g.t}</div>
              <div className="term-desc">{g.d}</div>
              {(g.m || g.v) && (
                <div className="term-src">
                  {g.m}
                  {g.m && g.v ? ' · ' : ''}
                  {g.v}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ Бүрхүүл */

export default function Library() {
  const [tab, setTab] = useState('notes')

  return (
    <div className="screen">
      <div className="eyebrow">Тэмдэглэл</div>
      <h1 className="h1">Замын дэвтэр</h1>

      <div className="row mt-12" style={{ gap: 8 }}>
        <button
          className={`btn ${tab === 'notes' ? 'btn-blue' : 'btn-ghost'}`}
          style={{ padding: '10px 18px', flex: 1 }}
          onClick={() => {
            sfx.tap()
            setTab('notes')
          }}
        >
          📓 Хичээлүүд
        </button>
        <button
          className={`btn ${tab === 'glossary' ? 'btn-blue' : 'btn-ghost'}`}
          style={{ padding: '10px 18px', flex: 1 }}
          onClick={() => {
            sfx.tap()
            setTab('glossary')
          }}
        >
          🔤 Толь
        </button>
      </div>

      <div className="mt-16">{tab === 'notes' ? <Notes /> : <Glossary />}</div>
    </div>
  )
}
