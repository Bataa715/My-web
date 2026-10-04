import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Md from './Md.jsx'
import { runChallenge } from '../lib/runner.js'
import { sfx } from '../lib/sound.js'
import { shuffledDistinct, shuffledBank, orderSeed, bankSeed, matchSeed } from '../lib/shuffle.js'

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

export function emptyValue(ex) {
  switch (ex.t) {
    case 'choice':
      return null
    case 'tf':
      return null
    case 'multi':
      return []
    case 'blank':
      return null
    case 'order':
      return null // компонент өөрөө эхлүүлнэ
    case 'match':
      return { matched: {}, misses: 0 }
    case 'code':
      return { source: ex.starter, passed: false, ran: false }
    default:
      return null
  }
}

export function isAnswered(ex, v) {
  switch (ex.t) {
    case 'choice':
    case 'tf':
      return v !== null && v !== undefined
    case 'multi':
      return Array.isArray(v) && v.length > 0
    case 'blank':
      return Boolean(v)
    case 'order':
      return Array.isArray(v) && v.length > 0
    case 'match':
      return v && Object.keys(v.matched).length === ex.pairs.length
    case 'code':
      return Boolean(v?.passed)
    default:
      return false
  }
}

export function isCorrect(ex, v) {
  switch (ex.t) {
    case 'choice':
      return v === ex.a
    case 'tf':
      return v === ex.a
    case 'multi': {
      const want = [...ex.a].sort().join(',')
      const got = [...v].sort().join(',')
      return want === got
    }
    case 'blank':
      return v === ex.a
    case 'order':
      return Array.isArray(v) && v.length === ex.items.length && v.every((x, i) => x === ex.items[i])
    case 'match':
      return v.misses === 0
    case 'code':
      return Boolean(v?.passed)
    default:
      return false
  }
}

export function correctText(ex) {
  switch (ex.t) {
    case 'choice':
      return ex.options[ex.a]
    case 'tf':
      return ex.a ? 'Үнэн' : 'Худал'
    case 'multi':
      return ex.a.map((i) => ex.options[i]).join(' · ')
    case 'blank':
      return ex.a
    case 'order':
      return ex.items.join(' → ')
    default:
      return null
  }
}

/* --------------------------------------------------------------- Choice */

function Choice({ ex, value, onChange, locked, showAnswer }) {
  return (
    <div className="opts">
      {ex.options.map((o, i) => {
        let cls = 'opt'
        if (showAnswer) {
          if (i === ex.a) cls += ' right'
          else if (i === value) cls += ' wrong'
        } else if (i === value) cls += ' sel'
        return (
          <motion.button
            key={i}
            className={cls}
            disabled={locked}
            whileTap={locked ? {} : { scale: 0.985 }}
            onClick={() => {
              sfx.tap()
              onChange(i)
            }}
          >
            <span className="opt-key">{KEYS[i]}</span>
            <span>{o}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------- True/False */

function TrueFalse({ ex, value, onChange, locked, showAnswer }) {
  const opts = [
    { v: true, label: 'Үнэн', icon: '✅' },
    { v: false, label: 'Худал', icon: '❌' },
  ]
  return (
    <div className="opts">
      {opts.map((o) => {
        let cls = 'opt'
        if (showAnswer) {
          if (o.v === ex.a) cls += ' right'
          else if (o.v === value) cls += ' wrong'
        } else if (o.v === value) cls += ' sel'
        return (
          <motion.button
            key={String(o.v)}
            className={cls}
            disabled={locked}
            whileTap={locked ? {} : { scale: 0.985 }}
            onClick={() => {
              sfx.tap()
              onChange(o.v)
            }}
          >
            <span className="opt-key">{o.icon}</span>
            <span>{o.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- Multi */

function Multi({ ex, value, onChange, locked, showAnswer }) {
  const v = value || []
  return (
    <div className="opts">
      {ex.options.map((o, i) => {
        const sel = v.includes(i)
        let cls = 'opt'
        if (showAnswer) {
          if (ex.a.includes(i)) cls += ' right'
          else if (sel) cls += ' wrong'
        } else if (sel) cls += ' sel'
        return (
          <motion.button
            key={i}
            className={cls}
            disabled={locked}
            whileTap={locked ? {} : { scale: 0.985 }}
            onClick={() => {
              sfx.tap()
              onChange((prev) => {
                const cur = prev || []
                return cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]
              })
            }}
          >
            <span className="opt-check">{sel ? '✓' : ''}</span>
            <span>{o}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

/* ---------------------------------------------------------------- Blank */

function Blank({ ex, value, onChange, locked, showAnswer }) {
  const bank = useMemo(() => shuffledBank(ex.bank, ex.a, bankSeed(ex)), [ex])
  const [before, after] = ex.q.split('___')
  let slotCls = 'blank-slot'
  if (showAnswer) slotCls += value === ex.a ? ' right' : ' wrong'
  else if (value) slotCls += ' filled'

  return (
    <div>
      <div className="blank-sentence">
        {before}
        <span className={slotCls}>{showAnswer ? ex.a : value || '   '}</span>
        {after}
      </div>
      <div className="bank">
        {bank.map((w) => (
          <motion.button
            key={w}
            className={`bank-word${value === w && !showAnswer ? ' used' : ''}`}
            disabled={locked}
            whileTap={locked ? {} : { scale: 0.94 }}
            onClick={() => {
              sfx.tap()
              onChange(value === w ? null : w)
            }}
          >
            {w}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Order */

function Order({ ex, value, onChange, locked, showAnswer }) {
  const start = useMemo(() => shuffledDistinct(ex.items, orderSeed(ex)), [ex])
  useEffect(() => {
    if (!value) onChange(start)
  }, [start]) // eslint-disable-line react-hooks/exhaustive-deps

  const list = value || start
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    sfx.tap()
    onChange(next)
  }

  return (
    <div className="order-list">
      {list.map((item, i) => {
        const ok = showAnswer && item === ex.items[i]
        const bad = showAnswer && item !== ex.items[i]
        return (
          <motion.div
            layout
            key={item}
            transition={{ type: 'spring', stiffness: 500, damping: 34 }}
            className="order-item placed"
            style={
              ok
                ? { borderColor: 'var(--green)', background: 'rgba(88,204,2,.1)' }
                : bad
                  ? { borderColor: 'var(--red)', background: 'rgba(255,75,75,.09)' }
                  : undefined
            }
          >
            <span className="order-num">{i + 1}</span>
            <span style={{ flex: 1 }}>{item}</span>
            {!locked && (
              <span className="order-arrows">
                <button className="arrow-btn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="дээш">
                  ▲
                </button>
                <button className="arrow-btn" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="доош">
                  ▼
                </button>
              </span>
            )}
          </motion.div>
        )
      })}
      {showAnswer && (
        <div className="test-detail" style={{ marginTop: 6 }}>
          Зөв дараалал: {ex.items.join(' → ')}
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- Match */

function Match({ ex, value, onChange, locked }) {
  const v = value || { matched: {}, misses: 0 }
  const lefts = ex.pairs.map((p) => p[0])
  const rights = useMemo(() => shuffledDistinct(ex.pairs.map((p) => p[1]), matchSeed(ex)), [ex])
  const [selL, setSelL] = useState(null)
  const [missKey, setMissKey] = useState(null)

  const pick = (side, idx) => {
    if (locked) return
    if (side === 'L') {
      sfx.tap()
      setSelL(selL === idx ? null : idx)
      return
    }
    if (selL === null) {
      sfx.tap()
      return
    }
    const wantedRight = ex.pairs[selL][1]
    if (rights[idx] === wantedRight) {
      sfx.correct()
      onChange({ ...v, matched: { ...v.matched, [selL]: idx } })
      setSelL(null)
    } else {
      sfx.wrong()
      setMissKey(`${selL}-${idx}`)
      onChange({ ...v, misses: v.misses + 1 })
      setTimeout(() => setMissKey(null), 380)
      setSelL(null)
    }
  }

  const matchedRights = new Set(Object.values(v.matched))

  return (
    <div>
      <div className="match-grid">
        <div className="match-col">
          {lefts.map((l, i) => (
            <button
              key={i}
              className={`match-item${v.matched[i] !== undefined ? ' paired' : selL === i ? ' sel' : ''}${
                missKey?.startsWith(`${i}-`) ? ' miss' : ''
              }`}
              onClick={() => pick('L', i)}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map((r, i) => (
            <button
              key={i}
              className={`match-item${matchedRights.has(i) ? ' paired' : ''}${missKey?.endsWith(`-${i}`) ? ' miss' : ''}`}
              onClick={() => pick('R', i)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="row mt-12" style={{ justifyContent: 'space-between' }}>
        <span className="pill green">
          {Object.keys(v.matched).length} / {ex.pairs.length} холбогдсон
        </span>
        {v.misses > 0 && <span className="pill red">{v.misses} алдаа</span>}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- Code */

function CodeEx({ ex, value, onChange, locked }) {
  const v = value || { source: ex.starter, passed: false, ran: false }
  const [out, setOut] = useState(null)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const taRef = useRef(null)

  const run = () => {
    const res = runChallenge(v.source, ex.fn, ex.cases)
    setOut(res)
    if (res.ok) sfx.complete()
    else sfx.wrong()
    onChange({ ...v, passed: res.ok, ran: true })
  }

  const onKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current
      const s = ta.selectionStart
      const next = v.source.slice(0, s) + '  ' + v.source.slice(ta.selectionEnd)
      onChange({ ...v, source: next })
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2
      })
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      run()
    }
  }

  return (
    <div>
      <div className="code-brief">
        <Md text={ex.brief} />
      </div>

      <div className="editor">
        <div className="editor-head">
          <span className="dot" style={{ background: '#ff5f57' }} />
          <span className="dot" style={{ background: '#febc2e' }} />
          <span className="dot" style={{ background: '#28c840' }} />
          <span style={{ marginLeft: 6 }}>{ex.fn}.js</span>
        </div>
        <textarea
          ref={taRef}
          className="code"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          value={v.source}
          disabled={locked}
          onKeyDown={onKeyDown}
          onChange={(e) => onChange({ ...v, source: e.target.value })}
        />
      </div>

      <div className="code-actions">
        <button className="btn btn-blue" onClick={run} disabled={locked}>
          ▶ Ажиллуулах
        </button>
        <button className="btn btn-ghost" onClick={() => setShowHint((s) => !s)}>
          💡 Сануулга
        </button>
        <button className="btn btn-ghost" onClick={() => onChange({ ...v, source: ex.starter, passed: false, ran: false })}>
          ↺ Дахин эхлэх
        </button>
        {out && !out.ok && (
          <button className="btn btn-ghost" onClick={() => setShowSolution((s) => !s)}>
            👀 Хариу
          </button>
        )}
      </div>

      <div className="faint mt-8" style={{ fontSize: 11.5 }}>
        Ctrl/Cmd + Enter — шууд ажиллуулах
      </div>

      {showHint && (
        <div className="hint-box">
          <Md text={ex.hint} />
        </div>
      )}

      {showSolution && (
        <div className="editor mt-12">
          <div className="editor-head">Нэг боломжит шийдэл</div>
          <textarea className="code" readOnly value={ex.solution} style={{ minHeight: 120 }} />
        </div>
      )}

      {out?.error && <div className="err-box">{out.error}</div>}

      {out && out.results.length > 0 && (
        <div className="tests">
          {out.results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`test-row ${r.pass ? 'pass' : 'fail'}`}
            >
              <span>{r.pass ? '✅' : '❌'}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ wordBreak: 'break-word' }}>{r.label}</div>
                {!r.pass && (
                  <div className="test-detail">
                    хүлээсэн: {r.expect} · буцаасан: {r.got}
                  </div>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- Dispatcher */

const KINDS = {
  choice: { label: 'Зөв хариултаа сонго', C: Choice },
  tf: { label: 'Үнэн үү, худал уу?', C: TrueFalse },
  multi: { label: 'Бүх зөв хариултыг сонго', C: Multi },
  blank: { label: 'Дутуу үгийг нөх', C: Blank },
  order: { label: 'Зөв дараалалд оруул', C: Order },
  match: { label: 'Хосыг нь холбо', C: Match },
  code: { label: 'Код бич', C: CodeEx },
}

export default function Exercise({ ex, value, onChange, locked, showAnswer }) {
  const kind = KINDS[ex.t]
  if (!kind) return <div className="sub">Танигдаагүй дасгал: {ex.t}</div>
  const C = kind.C
  return (
    <div>
      <div className="q-kicker">{kind.label}</div>
      <h2 className="q-title">{ex.q}</h2>
      <C ex={ex} value={value} onChange={onChange} locked={locked} showAnswer={showAnswer} />
    </div>
  )
}
