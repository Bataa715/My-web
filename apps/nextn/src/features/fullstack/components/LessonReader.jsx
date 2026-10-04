import { motion } from 'framer-motion'
import Md from './Md.jsx'

/**
 * Хичээлийн бүрэн эх — уншихад зориулсан байрлуулалт.
 *
 * teach = {
 *   lead,                              нэг догол мөрийн танилцуулга
 *   sections: [{ h, p:[], list:[], numbered:[], table:{head,rows}, note, example }],
 *   terms:   [[нэр, тайлбар], ...],    нэр томьёоны толь
 *   recap:   [...],                    санаж үлдээх зүйлс
 * }
 */
export default function LessonReader({ lesson, compact = false }) {
  const t = lesson.teach
  if (!t) return null

  const Wrap = compact ? 'div' : motion.div
  const wrapProps = compact ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } }

  return (
    <Wrap className="reader" {...wrapProps}>
      {!compact && (
        <header className="reader-head">
          <div style={{ fontSize: 46, lineHeight: 1 }}>{lesson.icon}</div>
          <div className="eyebrow">{lesson.unit?.town}</div>
          <h1 className="h1" style={{ fontSize: 26 }}>{lesson.title}</h1>
          <p className="sub">{lesson.subtitle}</p>
        </header>
      )}

      {t.lead && (
        <p className="reader-lead">
          <Md text={t.lead} />
        </p>
      )}

      {t.sections?.map((s, i) => (
        <section className="reader-section" key={i}>
          {s.h && <h2 className="reader-h">{s.h}</h2>}

          {s.p?.map((para, k) => (
            <p className="reader-p" key={k}>
              <Md text={para} />
            </p>
          ))}

          {s.list && (
            <ul className="reader-list">
              {s.list.map((li, k) => (
                <li key={k}>
                  <Md text={li} />
                </li>
              ))}
            </ul>
          )}

          {s.numbered && (
            <ol className="reader-ol">
              {s.numbered.map((li, k) => (
                <li key={k}>
                  <Md text={li} />
                </li>
              ))}
            </ol>
          )}

          {s.table && (
            <div className="reader-table-wrap">
              <table className="reader-table">
                <thead>
                  <tr>
                    {s.table.head.map((h, k) => (
                      <th key={k}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row, k) => (
                    <tr key={k}>
                      {row.map((cell, c) => (
                        <td key={c}>
                          <Md text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {s.example && (
            <div className="reader-example">
              <div className="reader-example-tag">Жишээ</div>
              <Md text={s.example} />
            </div>
          )}

          {s.note && (
            <div className="reader-note">
              <span className="reader-note-ico">💡</span>
              <span>
                <Md text={s.note} />
              </span>
            </div>
          )}
        </section>
      ))}

      {t.terms?.length > 0 && (
        <section className="reader-section">
          <h2 className="reader-h">Нэр томьёо</h2>
          <div className="terms">
            {t.terms.map(([name, desc], i) => (
              <div className="term" key={i}>
                <div className="term-name">{name}</div>
                <div className="term-desc">
                  <Md text={desc} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {t.recap?.length > 0 && (
        <section className="recap">
          <div className="recap-title">🎒 Санаж үлдээх</div>
          <ul>
            {t.recap.map((r, i) => (
              <li key={i}>
                <Md text={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Wrap>
  )
}
