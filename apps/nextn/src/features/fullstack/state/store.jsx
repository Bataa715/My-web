import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { PATH, ACHIEVEMENTS } from '../data/curriculum.js'

const KEY = 'aylal.progress.v1'

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a, b) {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000)
}

const initial = {
  name: '',
  xp: 0,
  gems: 20,
  streak: 0,
  lastDay: null,
  dailyGoal: 60,
  todayXp: 0,
  todayDay: today(),
  completed: {}, // lessonId -> { stars, best, perfect, at }
  mistakes: [], // { lessonId, exerciseIndex, q, at }
  achievements: {}, // id -> timestamp
  soundOn: true,
  history: {}, // 'YYYY-MM-DD' -> xp
}

function rollDay(s) {
  const d = today()
  if (s.todayDay === d) return s
  return { ...s, todayDay: d, todayXp: 0 }
}

function reducer(state, action) {
  switch (action.type) {
    case 'tick':
      return rollDay(state)

    case 'setName':
      return { ...state, name: action.name }

    case 'toggleSound':
      return { ...state, soundOn: !state.soundOn }

    case 'addMistake': {
      const mistakes = [action.entry, ...state.mistakes.filter((m) => m.key !== action.entry.key)].slice(0, 60)
      return { ...state, mistakes }
    }

    case 'clearMistake':
      return { ...state, mistakes: state.mistakes.filter((m) => m.key !== action.key) }

    case 'finishLesson': {
      const { lessonId, xp, perfect, gems, ephemeral } = action
      let s = rollDay(state)
      const d = today()

      // цуваа (streak)
      let streak = s.streak
      if (s.lastDay !== d) {
        const gap = s.lastDay ? daysBetween(s.lastDay, d) : 999
        streak = gap === 1 ? s.streak + 1 : 1
      }

      // Дасгалын горимын түр хичээл замын явцад бүртгэгдэхгүй
      const prev = s.completed[lessonId]
      const completed = ephemeral
        ? s.completed
        : {
            ...s.completed,
            [lessonId]: {
              stars: Math.max(prev?.stars || 0, perfect ? 3 : xp > 0 ? 2 : 1),
              perfect: prev?.perfect || perfect,
              times: (prev?.times || 0) + 1,
              at: Date.now(),
            },
          }

      const history = { ...s.history, [d]: (s.history[d] || 0) + xp }

      return {
        ...s,
        xp: s.xp + xp,
        todayXp: s.todayXp + xp,
        gems: s.gems + (gems || 0),
        streak,
        lastDay: d,
        completed,
        history,
      }
    }

    case 'unlock': {
      if (state.achievements[action.id]) return state
      return { ...state, achievements: { ...state.achievements, [action.id]: Date.now() }, gems: state.gems + 15 }
    }

    case 'setGoal':
      return { ...state, dailyGoal: action.goal }

    case 'reset':
      return { ...initial, name: state.name, todayDay: today() }

    case 'hydrate':
      return { ...initial, ...action.state, todayDay: action.state.todayDay || today() }

    default:
      return state
  }
}

const Ctx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial, (init) => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return rollDay(refillHearts({ ...init, ...JSON.parse(raw) }))
    } catch {}
    return init
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 20000)
    return () => clearInterval(id)
  }, [])

  const derived = useMemo(() => {
    const doneCount = PATH.filter((l) => state.completed[l.id]).length
    // Замын түгжээ: өмнөх зогсоол дуусмагц дараагийнх нээгдэнэ
    const unlocked = new Set()
    for (let i = 0; i < PATH.length; i++) {
      const l = PATH[i]
      if (i === 0) unlocked.add(l.id)
      else if (state.completed[PATH[i - 1].id]) unlocked.add(l.id)
    }
    const currentIndex = PATH.findIndex((l) => !state.completed[l.id])
    return {
      doneCount,
      unlocked,
      currentIndex: currentIndex === -1 ? PATH.length - 1 : currentIndex,
      currentLesson: PATH[currentIndex === -1 ? PATH.length - 1 : currentIndex],
      totalCount: PATH.length,
      earned: ACHIEVEMENTS.filter((a) => state.achievements[a.id]),
    }
  }, [state.completed, state.achievements])

  const value = useMemo(() => ({ state, dispatch, ...derived }), [state, derived])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore must be used inside StoreProvider')
  return v
}

export { today, daysBetween }
