import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import JourneyMap from './components/JourneyMap.jsx'
import LessonSession from './components/LessonSession.jsx'
import Practice from './components/Practice.jsx'
import Library from './components/Library.jsx'
import Profile from './components/Profile.jsx'
import { useStore } from './state/store.jsx'
import { levelFor, ACHIEVEMENTS, PATH, UNITS } from './data/curriculum.js'
import { setSoundEnabled, sfx } from './lib/sound.js'

const TABS = [
  { id: 'map', label: 'Аялал', icon: '🗺️' },
  { id: 'practice', label: 'Дасгал', icon: '🎯' },
  { id: 'library', label: 'Дэвтэр', icon: '📓' },
  { id: 'profile', label: 'Профайл', icon: '🧑‍🚀' },
]

function TopBar() {
  const { state, dispatch } = useStore()
  const lvl = levelFor(state.xp)

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="icon-btn" href="/#tools" title="Хэрэгслүүд рүү буцах" aria-label="Хэрэгслүүд рүү буцах">
          ←
        </a>
        <span className="stat streak" title="Өдрийн цуваа">
          <span className="ico">🔥</span>
          {state.streak}
        </span>
        <span className="stat gems" title="Очир эрдэнэ">
          <span className="ico">💎</span>
          {state.gems}
        </span>
        <span className="stat xp" title="Нийт XP">
          <span className="ico">{lvl.badge}</span>
          {state.xp}
        </span>
        <div className="spacer" />
        <button className="icon-btn" onClick={() => dispatch({ type: 'toggleSound' })} title="Дуу чимээ">
          {state.soundOn ? '🔊' : '🔇'}
        </button>
      </div>
    </header>
  )
}

function Toasts({ items }) {
  return (
    <div className="toast-wrap">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            className="toast"
            initial={{ opacity: 0, y: -18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          >
            <span className="ti">{t.icon}</span>
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState('map')
  const [active, setActive] = useState(null) // явж буй хичээл
  const [toasts, setToasts] = useState([])
  const seenAch = useRef(new Set(Object.keys(state.achievements)))
  const seenLevel = useRef(levelFor(state.xp).index)

  useEffect(() => setSoundEnabled(state.soundOn), [state.soundOn])

  const push = (icon, text) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, icon, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }

  // шинэ тэмдэг
  useEffect(() => {
    for (const id of Object.keys(state.achievements)) {
      if (!seenAch.current.has(id)) {
        seenAch.current.add(id)
        const a = ACHIEVEMENTS.find((x) => x.id === id)
        if (a) push(a.icon, `Тэмдэг нээгдлээ: ${a.title}`)
      }
    }
  }, [state.achievements])

  // түвшин ахих
  useEffect(() => {
    const lvl = levelFor(state.xp)
    if (lvl.index > seenLevel.current) {
      seenLevel.current = lvl.index
      sfx.levelUp()
      push(lvl.badge, `Шинэ түвшин: ${lvl.name}`)
    }
  }, [state.xp])

  // өдрийн зорилт биелэх
  const goalHit = useRef(false)
  useEffect(() => {
    if (state.todayXp >= state.dailyGoal && !goalHit.current) {
      goalHit.current = true
      push('🎯', `Өдрийн зорилт биеллээ — ${state.dailyGoal} XP!`)
    }
    if (state.todayXp === 0) goalHit.current = false
  }, [state.todayXp, state.dailyGoal])

  // Явцаас хамаарсан тэмдгүүд
  useEffect(() => {
    if (state.streak >= 3) dispatch({ type: 'unlock', id: 'streak3' })
    if (state.streak >= 7) dispatch({ type: 'unlock', id: 'streak7' })
    if (state.xp >= 1000) dispatch({ type: 'unlock', id: 'xp1000' })
    if (UNITS[0].lessons.every((l) => state.completed[l.id])) dispatch({ type: 'unlock', id: 'unit1' })
    const u7 = UNITS.find((u) => u.id === 'u7')
    if (u7 && u7.lessons.every((l) => state.completed[l.id])) dispatch({ type: 'unlock', id: 'unit7' })
    const code = PATH.filter((l) => l.kind === 'code')
    if (code.length && code.every((l) => state.completed[l.id])) dispatch({ type: 'unlock', id: 'allcode' })
  }, [state.streak, state.xp, state.completed, dispatch])

  const screens = {
    map: <JourneyMap onOpen={setActive} />,
    practice: <Practice onOpen={setActive} />,
    library: <Library />,
    profile: <Profile />,
  }

  return (
    <div className="app">
      <TopBar />
      <Toasts items={toasts} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {screens[tab]}
        </motion.div>
      </AnimatePresence>

      <nav className="nav">
        <div className="nav-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-btn${tab === t.id ? ' on' : ''}`}
              onClick={() => {
                sfx.tap()
                setTab(t.id)
              }}
            >
              <span className="ico">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.24 }}>
            <LessonSession key={active.id} lesson={active} onExit={() => setActive(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
