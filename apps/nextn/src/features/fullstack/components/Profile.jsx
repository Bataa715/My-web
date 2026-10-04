import { useState } from 'react'
import { motion } from 'framer-motion'
import { ACHIEVEMENTS, levelFor, PATH } from '../data/curriculum.js'
import { useStore, today } from '../state/store.jsx'
import { sfx } from '../lib/sound.js'

const DAY_NAMES = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя']

function lastDays(n) {
  const out = []
  const d = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d)
    x.setDate(d.getDate() - i)
    out.push({
      key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`,
      label: DAY_NAMES[x.getDay()],
    })
  }
  return out
}

export default function Profile() {
  const { state, dispatch, doneCount, totalCount } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const lvl = levelFor(state.xp)
  const days = lastDays(7)
  const maxDay = Math.max(state.dailyGoal, ...days.map((d) => state.history[d.key] || 0))
  const t = today()

  const codeDone = PATH.filter((l) => l.kind === 'code' && state.completed[l.id]).length
  const codeTotal = PATH.filter((l) => l.kind === 'code').length
  const goalPct = Math.min(100, Math.round((state.todayXp / state.dailyGoal) * 100))

  return (
    <div className="screen">
      <div className="eyebrow">Профайл</div>
      <h1 className="h1">{state.name || 'Аялагч'}</h1>

      {/* Түвшин */}
      <div className="card mt-16">
        <div className="row" style={{ gap: 14 }}>
          <div style={{ fontSize: 42, lineHeight: 1 }}>{lvl.badge}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">Түвшин {lvl.index + 1}</div>
            <div className="h2" style={{ margin: '1px 0 8px', fontSize: 19 }}>
              {lvl.name}
            </div>
            <div className="bar thin">
              <motion.div
                className="bar-fill amber"
                initial={{ width: 0 }}
                animate={{ width: `${lvl.progress * 100}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            </div>
            <div className="faint mt-8" style={{ fontSize: 12 }}>
              {lvl.next ? `${lvl.next.min - state.xp} XP → ${lvl.next.name}` : 'Хамгийн дээд түвшин'}
            </div>
          </div>
        </div>
      </div>

      {/* Өнөөдрийн зорилт */}
      <div className="card mt-12">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="eyebrow">Өнөөдрийн зорилт</div>
          <div className="pill amber">
            {state.todayXp} / {state.dailyGoal} XP
          </div>
        </div>
        <div className="bar">
          <motion.div className="bar-fill" initial={{ width: 0 }} animate={{ width: `${goalPct}%` }} transition={{ duration: 0.6 }} />
        </div>
        <div className="row wrap mt-12" style={{ gap: 7 }}>
          {[30, 60, 100, 150].map((g) => (
            <button
              key={g}
              className={`pill${state.dailyGoal === g ? ' amber' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                sfx.tap()
                dispatch({ type: 'setGoal', goal: g })
              }}
            >
              {g} XP
            </button>
          ))}
        </div>
      </div>

      {/* Тоон үзүүлэлт */}
      <div className="grid-3 mt-12">
        <div className="tile">
          <div className="k">Цуваа</div>
          <div className="v" style={{ color: '#ffb03a' }}>🔥 {state.streak}</div>
        </div>
        <div className="tile">
          <div className="k">Нийт XP</div>
          <div className="v" style={{ color: 'var(--amber)' }}>{state.xp}</div>
        </div>
        <div className="tile">
          <div className="k">Очир эрдэнэ</div>
          <div className="v" style={{ color: 'var(--blue)' }}>💎 {state.gems}</div>
        </div>
        <div className="tile">
          <div className="k">Зогсоол</div>
          <div className="v">{doneCount}/{totalCount}</div>
        </div>
        <div className="tile">
          <div className="k">Кодын даалгавар</div>
          <div className="v" style={{ color: 'var(--green)' }}>{codeDone}/{codeTotal}</div>
        </div>
      </div>

      {/* 7 хоногийн график */}
      <div className="card mt-12">
        <div className="eyebrow">Сүүлийн 7 хоног</div>
        <div className="week">
          {days.map((d) => {
            const xp = state.history[d.key] || 0
            const h = maxDay > 0 ? Math.max(4, (xp / maxDay) * 68) : 4
            return (
              <div className="week-col" key={d.key}>
                <div style={{ fontSize: 10.5, fontWeight: 900, color: xp ? 'var(--green)' : 'var(--text-faint)' }}>
                  {xp || ''}
                </div>
                <motion.div
                  className={`week-bar${xp ? '' : ' empty'}`}
                  initial={{ height: 0 }}
                  animate={{ height: h }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                <div className={`week-lab${d.key === t ? ' today' : ''}`}>{d.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Тэмдгүүд */}
      <h2 className="h2 mt-32">
        Тэмдэг{' '}
        <span className="pill amber" style={{ verticalAlign: 'middle' }}>
          {Object.keys(state.achievements).length}/{ACHIEVEMENTS.length}
        </span>
      </h2>
      <div className="grid-3">
        {ACHIEVEMENTS.map((a) => {
          const on = Boolean(state.achievements[a.id])
          return (
            <div className={`ach${on ? ' on' : ''}`} key={a.id}>
              <div className="ai">{a.icon}</div>
              <div className="at">{a.title}</div>
              <div className="ad">{a.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Тохиргоо */}
      <h2 className="h2 mt-32">Тохиргоо</h2>
      <div className="card">
        <label className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="sub" style={{ color: 'var(--text)' }}>Нэр</span>
          <input
            value={state.name}
            placeholder="Нэрээ бич"
            onChange={(e) => dispatch({ type: 'setName', name: e.target.value })}
            style={{
              background: 'var(--surface-2)',
              border: '2px solid var(--line)',
              borderRadius: 12,
              padding: '9px 13px',
              color: 'var(--text)',
              font: 'inherit',
              fontSize: 14,
              width: 180,
              outline: 'none',
            }}
          />
        </label>

        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="sub" style={{ color: 'var(--text)' }}>Дуу чимээ</span>
          <button className={`btn ${state.soundOn ? 'btn-green' : 'btn-ghost'}`} style={{ padding: '9px 18px' }} onClick={() => dispatch({ type: 'toggleSound' })}>
            {state.soundOn ? '🔊 Асаалттай' : '🔇 Унтраалттай'}
          </button>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="sub" style={{ color: 'var(--text)' }}>Бүх явцыг арилгах</span>
          <button className="btn btn-ghost" style={{ padding: '9px 18px', color: 'var(--red)', borderColor: 'rgba(255,75,75,.4)' }} onClick={() => setConfirmReset(true)}>
            Дахин эхлэх
          </button>
        </div>
      </div>

      <p className="faint center mt-24" style={{ fontSize: 12, lineHeight: 1.6 }}>
        Явц энэ браузерын localStorage-д хадгалагдана.
        <br />
        Агуулга: IBM «Introduction to Software Engineering» — Модуль 1.
      </p>

      {confirmReset && (
        <div className="modal-back" onClick={() => setConfirmReset(false)}>
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 44 }}>⚠️</div>
            <h2 className="h2 mt-8">Бүгдийг арилгах уу?</h2>
            <p className="sub">XP, цуваа, тэмдэг, дуусгасан зогсоол бүгд устана. Буцаах боломжгүй.</p>
            <div className="row mt-24" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
                Болих
              </button>
              <button
                className="btn btn-red"
                onClick={() => {
                  dispatch({ type: 'reset' })
                  setConfirmReset(false)
                }}
              >
                Тийм, арилга
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
