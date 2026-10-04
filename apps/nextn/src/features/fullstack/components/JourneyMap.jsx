import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { UNITS } from '../data/curriculum.js'
import { useStore } from '../state/store.jsx'
import { sfx } from '../lib/sound.js'

const KIND_LABEL = {
  lesson: 'Хичээл',
  code: 'Кодын даалгавар',
  review: 'Давталт',
  boss: 'Шалгалт',
}

function Stop({ lesson, index, status, stars, onOpen, hue, nodeRef }) {
  const side = index % 2 === 0 ? '' : ' right'
  const locked = status === 'locked'

  return (
    <div className={`stop${side}`}>
      <div style={{ position: 'relative' }} ref={nodeRef}>
        {status === 'current' && (
          <motion.span
            className="stop-ring"
            style={{ borderRadius: lesson.kind === 'boss' ? 26 : '50%' }}
            animate={{ scale: [1, 1.13, 1], opacity: [0.55, 0.1, 0.55] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <motion.button
          className={`stop-node ${status}${lesson.kind === 'boss' ? ' boss' : ''}`}
          style={{ '--hue': hue }}
          whileHover={locked ? {} : { scale: 1.05 }}
          whileTap={locked ? {} : { scale: 0.95 }}
          onClick={() => {
            if (locked) {
              sfx.wrong()
              return
            }
            sfx.tap()
            onOpen(lesson)
          }}
          aria-label={lesson.title}
        >
          {locked ? '🔒' : lesson.icon}
          {stars > 0 && (
            <span className="stop-stars">{'⭐'.repeat(Math.min(3, stars))}</span>
          )}
        </motion.button>
      </div>

      <div className="stop-meta">
        <div className="stop-kind">{KIND_LABEL[lesson.kind]}</div>
        <div className="stop-title">{lesson.title}</div>
        <div className="stop-sub">{lesson.subtitle}</div>
      </div>
    </div>
  )
}

export default function JourneyMap({ onOpen }) {
  const { state, unlocked, currentLesson, doneCount, totalCount } = useStore()
  const riderRef = useRef(null)
  const containerRef = useRef(null)
  const nodeRefs = useRef({})
  const [riderY, setRiderY] = useState(null)

  useLayoutEffect(() => {
    const el = nodeRefs.current[currentLesson?.id]
    const box = containerRef.current
    if (!el || !box) return
    const y = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
    setRiderY(y - 42)
  }, [currentLesson?.id, doneCount])

  // одоогийн зогсоол руу нэг удаа гүйлгэнэ
  useEffect(() => {
    const el = nodeRefs.current[currentLesson?.id]
    if (el) {
      const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 320)
      return () => clearTimeout(t)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  let flatIndex = -1

  return (
    <div className="screen" ref={containerRef} style={{ position: 'relative' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div className="eyebrow">Модуль 1–6 · Software Engineering</div>
          <h1 className="h1" style={{ margin: '2px 0 0' }}>Аялал</h1>
        </div>
        <div className="pill green">
          {doneCount} / {totalCount} зогсоол
        </div>
      </div>

      {riderY !== null && (
        <motion.div
          ref={riderRef}
          className="rider"
          initial={false}
          animate={{ top: riderY, x: -60 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          <span className="rider-glow" />
          <motion.span
            style={{ display: 'inline-block' }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            🏍️
          </motion.span>
        </motion.div>
      )}

      {UNITS.map((unit) => {
        const done = unit.lessons.filter((l) => state.completed[l.id]).length
        const pct = Math.round((done / unit.lessons.length) * 100)
        return (
          <section key={unit.id}>
            <div className="unit-header" style={{ '--hue': unit.hue }}>
              <div className="u-town">{unit.town}</div>
              <div className="u-title">{unit.title}</div>
              <p className="u-blurb">{unit.blurb}</p>
              <div className="unit-progress">
                <div className="bar thin" style={{ maxWidth: 190 }}>
                  <div className="bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span>
                  {done}/{unit.lessons.length}
                </span>
              </div>
              <div className="u-icon">{unit.icon}</div>
            </div>

            <div className="road">
              <div className="road-line" />
              {unit.lessons.map((lesson) => {
                flatIndex++
                const rec = state.completed[lesson.id]
                const status = rec ? 'done' : unlocked.has(lesson.id) ? 'current' : 'locked'
                return (
                  <Stop
                    key={lesson.id}
                    lesson={{ ...lesson, unit }}
                    index={flatIndex}
                    status={status}
                    stars={rec?.stars || 0}
                    hue={unit.hue}
                    onOpen={onOpen}
                    nodeRef={(el) => (nodeRefs.current[lesson.id] = el)}
                  />
                )
              })}
            </div>
          </section>
        )
      })}

      <div className="card center mt-16" style={{ borderStyle: 'dashed' }}>
        <div style={{ fontSize: 36 }}>🏁</div>
        <div className="h2 mt-8">Замын төгсгөл</div>
        <p className="sub">
          Курсийн бүх модуль (1–6) энэ замд орсон. Шинэ курс эсвэл материал нэмэхэд зам үргэлжилнэ —
          шинэ фолдер үүсгээд надад хэлэхэд шинэ хотууд бүтээе.
        </p>
      </div>
    </div>
  )
}
