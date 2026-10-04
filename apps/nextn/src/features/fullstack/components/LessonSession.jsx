import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Exercise, { emptyValue, isAnswered, isCorrect, correctText } from './Exercises.jsx'
import Md from './Md.jsx'
import LessonReader from './LessonReader.jsx'
import { sfx } from '../lib/sound.js'
import { useStore } from '../state/store.jsx'
import { XP_PER_EXERCISE, XP_LESSON_BONUS } from '../data/curriculum.js'

const PRAISE = ['Гоё!', 'Яг таарлаа!', 'Сайхан!', 'Мундаг шүү!', 'Зөв дөө!', 'Замаа олж байна!']
const NUDGE = ['Дахин хармаар байна', 'Ойрхон боллоо', 'Одоохондоо биш']

export default function LessonSession({ lesson, onExit }) {
  const { state, dispatch } = useStore()
  const [phase, setPhase] = useState('intro') // intro | quiz | done
  const [queue, setQueue] = useState(() => lesson.exercises.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [values, setValues] = useState(() => lesson.exercises.map(emptyValue))
  const [checked, setChecked] = useState(null) // { correct }
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [right, setRight] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [requeued, setRequeued] = useState(() => new Set())
  const [xp, setXp] = useState(0)
  const [peek, setPeek] = useState(false)

  const total = queue.length
  const exIndex = queue[pos]
  const ex = lesson.exercises[exIndex]
  const value = values[exIndex]
  const mistakeKey = ex ? ex.srcKey || `${lesson.id}:${exIndex}` : null
  const progress = total === 0 ? 1 : pos / total

  const isBoss = lesson.kind === 'boss'

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  // Утга эсвэл updater функц хоёуланг дэмжинэ — дараалсан товшилт нэг render-т багтсан ч зөв хуримтлагдана
  const setValue = (v) =>
    setValues((prev) => prev.map((x, i) => (i === exIndex ? (typeof v === 'function' ? v(x) : v) : x)))

  const check = () => {
    const ok = isCorrect(ex, value)
    setChecked({ correct: ok })
    if (ok) {
      sfx.correct()
      const nextCombo = combo + 1
      setCombo(nextCombo)
      setMaxCombo((m) => Math.max(m, nextCombo))
      setRight((r) => r + 1)
      const bonus = nextCombo >= 5 ? 6 : nextCombo >= 3 ? 3 : 0
      setXp((x) => x + XP_PER_EXERCISE + bonus + (ex.t === 'code' ? 10 : 0))
    } else {
      sfx.wrong()
      setCombo(0)
      setWrong((w) => w + 1)
      if (mistakeKey) {
        dispatch({
          type: 'addMistake',
          entry: {
            key: mistakeKey,
            lessonId: ex.srcLesson || lesson.id,
            lessonTitle: ex.srcTitle || lesson.title,
            exerciseIndex: ex.srcIndex ?? exIndex,
            q: ex.q,
            at: Date.now(),
          },
        })
      }
    }
  }

  const advance = () => {
    const wasCorrect = checked?.correct
    setChecked(null)

    let nextQueue = queue
    if (!wasCorrect && !requeued.has(exIndex)) {
      nextQueue = [...queue, exIndex]
      setQueue(nextQueue)
      setRequeued((s) => new Set(s).add(exIndex))
      // дахин үзэхэд хариултыг цэвэрлэнэ
      setValues((prev) => prev.map((x, i) => (i === exIndex && ex.t !== 'code' ? emptyValue(ex) : x)))
    } else if (wasCorrect && mistakeKey && !requeued.has(exIndex)) {
      // Энэ session-д алдаад дараа нь зассан бол дэвтэрт үлдээнэ —
      // өөр өдөр, шинэ session-д эхний оролдлогоор зөв хариулж байж арилна.
      dispatch({ type: 'clearMistake', key: mistakeKey })
    }

    if (pos + 1 >= nextQueue.length) finish()
    else setPos(pos + 1)
  }

  const finish = () => {
    const perfect = wrong === 0
    const bonus = XP_LESSON_BONUS[lesson.kind] ?? 20
    const perfectBonus = perfect ? 30 : 0
    const totalXp = xp + bonus + perfectBonus
    const gems = lesson.kind === 'boss' ? 60 : perfect ? 15 : 8

    dispatch({ type: 'finishLesson', lessonId: lesson.id, xp: totalXp, perfect, gems, ephemeral: Boolean(lesson.ephemeral) })

    // тэмдгүүд
    if (!lesson.ephemeral) {
      dispatch({ type: 'unlock', id: 'first_ride' })
      if (lesson.kind === 'code') dispatch({ type: 'unlock', id: 'coder' })
    }
    if (lesson.kind === 'boss' && !lesson.ephemeral) dispatch({ type: 'unlock', id: 'boss1' })
    if (lesson.id === 'u6b1') dispatch({ type: 'unlock', id: 'module1' })
    if (lesson.id === 'u10b1') dispatch({ type: 'unlock', id: 'module2' })
    if (lesson.id === 'u13b1') dispatch({ type: 'unlock', id: 'module3' })
    if (lesson.id === 'u16b1') dispatch({ type: 'unlock', id: 'module4' })
    if (lesson.id === 'u19b1') dispatch({ type: 'unlock', id: 'module5' })
    if (lesson.id === 'u20b1') dispatch({ type: 'unlock', id: 'finish' })
    if (perfect) dispatch({ type: 'unlock', id: 'perfect' })
    if (maxCombo >= 10) dispatch({ type: 'unlock', id: 'combo10' })
    const h = new Date().getHours()
    if (h >= 0 && h < 5) dispatch({ type: 'unlock', id: 'night' })

    setXp(totalXp)
    setPhase('done')
    sfx.complete()
    confetti({
      particleCount: perfect ? 160 : 90,
      spread: 78,
      origin: { y: 0.62 },
      colors: ['#58cc02', '#ffc800', '#1cb0f6', '#ce82ff'],
      disableForReducedMotion: true,
    })
  }

  /* -------------------------------------------------------------- intro */

  if (phase === 'intro') {
    return (
      <div className="lesson-shell">
        <div className="lesson-top">
          <button className="icon-btn" onClick={onExit} aria-label="хаах">
            ✕
          </button>
          <div className="spacer" />
          <span className="pill">{lesson.exercises.length} даалгавар</span>
        </div>
        <div className="lesson-body">
          <LessonReader lesson={lesson} />

          {isBoss && (
            <div className="reader">
              <div className="card mt-24" style={{ borderColor: 'rgba(255,200,0,.4)' }}>
                <div className="row">
                  <span style={{ fontSize: 26 }}>⚠️</span>
                  <div className="sub" style={{ color: 'var(--amber)' }}>
                    Энэ бол шалгалт — бүх нэгжийг хамарна. Хязгаар байхгүй, дуустал ажиллуулаарай.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="feedback ok" style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <div className="feedback-inner">
            <div className="fb-text">
              <div className="row" style={{ gap: 8 }}>
                <span className="pill amber">🔥 {state.streak} өдөр</span>
                <span className="pill">{lesson.exercises.length} даалгавар</span>
              </div>
            </div>
            <button
              className="btn btn-green btn-lg fb-cta"
              onClick={() => {
                sfx.engine()
                setPhase('quiz')
              }}
            >
              Уншсан, дасгал руу
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --------------------------------------------------------------- done */

  if (phase === 'done') {
    const acc = Math.round((right / Math.max(1, right + wrong)) * 100)
    return (
      <div className="lesson-shell">
        <div className="lesson-body">
          <motion.div className="complete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div
              className="complete-emoji"
              initial={{ rotate: -14, y: 20 }}
              animate={{ rotate: 0, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            >
              {wrong === 0 ? '🏆' : '🏍️'}
            </motion.div>
            <h1 className="h1">{wrong === 0 ? 'Төгс давлаа!' : 'Зогсоол дуусгалаа!'}</h1>
            <p className="sub">
              {lesson.unit.town} · {lesson.title}
            </p>

            <div className="reward-row">
              <div className="reward xp">
                <div className="label">XP</div>
                <div className="value">+{xp}</div>
              </div>
              <div className="reward acc">
                <div className="label">Нарийвчлал</div>
                <div className="value">{acc}%</div>
              </div>
              <div className="reward combo">
                <div className="label">Хамгийн урт цуваа</div>
                <div className="value">{maxCombo}</div>
              </div>
            </div>

            {wrong > 0 && (
              <p className="sub mt-16">
                {wrong} алдаа «Алдаанууд» хэсэгт хадгалагдлаа — дараа нь давтаж болно.
              </p>
            )}
          </motion.div>
        </div>
        <div className="feedback ok">
          <div className="feedback-inner">
            <div className="fb-text">
              <div className="fb-title">Замаа үргэлжлүүлье</div>
              <div className="fb-why">Дараагийн зогсоол нээгдлээ.</div>
            </div>
            <button className="btn btn-green btn-lg fb-cta" onClick={onExit}>
              Үргэлжлүүлэх
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* --------------------------------------------------------------- quiz */

  const answered = isAnswered(ex, value)
  const showAnswer = Boolean(checked) && ex.t !== 'match' && ex.t !== 'code'

  return (
    <div className="lesson-shell">
      <div className="lesson-top">
        <button className="icon-btn" onClick={onExit} aria-label="хаах">
          ✕
        </button>
        <div className="bar">
          <motion.div
            className="bar-fill"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          />
        </div>
        <span className="stat" style={{ color: 'var(--green)' }} title="Зүрх байхгүй — хязгааргүй оролдож болно">
          <span className="ico">♾️</span>
        </span>
        {lesson.teach && (
          <button className="icon-btn" onClick={() => setPeek(true)} title="Хичээлээ эргэж харах">
            📖
          </button>
        )}
      </div>

      <AnimatePresence>
        {combo >= 3 && !checked && (
          <motion.div
            className="combo-chip"
            initial={{ opacity: 0, y: -10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            ⚡ {combo} цуваа
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lesson-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${pos}-${exIndex}`}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
          >
            <Exercise ex={ex} value={value} onChange={setValue} locked={Boolean(checked)} showAnswer={showAnswer} />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {peek && (
          <>
            <motion.div
              className="peek-back"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPeek(false)}
            />
            <motion.div
              className="peek"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            >
              <div className="peek-bar">
                <span className="peek-title">📖 {lesson.title}</span>
                <button className="icon-btn" onClick={() => setPeek(false)} aria-label="хаах">
                  ✕
                </button>
              </div>
              <div className="peek-body">
                <LessonReader lesson={lesson} compact />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {checked ? (
          <motion.div
            className={`feedback ${checked.correct ? 'ok' : 'no'}`}
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="feedback-inner">
              <div className="fb-icon">{checked.correct ? '✅' : '❌'}</div>
              <div className="fb-text">
                <div className="fb-title">
                  {checked.correct ? PRAISE[right % PRAISE.length] : NUDGE[wrong % NUDGE.length]}
                </div>
                <div className="fb-why">
                  {!checked.correct && correctText(ex) && (
                    <div style={{ marginBottom: 4 }}>
                      <b>Зөв хариулт:</b> {correctText(ex)}
                    </div>
                  )}
                  {ex.why && <Md text={ex.why} />}
                </div>
              </div>
              <button
                className={`btn btn-lg fb-cta ${checked.correct ? 'btn-green' : 'btn-red'}`}
                onClick={advance}
                autoFocus
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="feedback"
            style={{ background: 'rgba(11,15,28,.94)', borderColor: 'var(--line-soft)', backdropFilter: 'blur(12px)' }}
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          >
            <div className="feedback-inner">
              <div className="fb-text">
                <div className="row wrap" style={{ gap: 8 }}>
                  <span className="pill">
                    {pos + 1} / {total}
                  </span>
                  {ex.t === 'match' && <span className="pill">Хосыг холбож дуусга</span>}
                </div>
              </div>
              <button className="btn btn-green btn-lg fb-cta" disabled={!answered} onClick={check}>
                {ex.t === 'code' ? 'Хүлээн авах' : 'Шалгах'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
