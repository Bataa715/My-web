// Кодын даалгаврыг браузерт ажиллуулж, тест кейсүүдийг шалгана.

export function deepEqual(a, b) {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isNaN(a) && Number.isNaN(b)) return true
    return Math.abs(a - b) < 1e-9
  }
  if (a === null || b === null) return false
  if (typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => deepEqual(a[k], b[k]))
}

export function show(v) {
  if (typeof v === 'string') return JSON.stringify(v)
  if (v === undefined) return 'undefined'
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

const FORBIDDEN = /\b(while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\))/

/**
 * @param {string} source  хэрэглэгчийн код
 * @param {string} fnName  шалгах функцийн нэр
 * @param {Array<{args:any[], expect:any}>} cases
 */
export function runChallenge(source, fnName, cases) {
  if (FORBIDDEN.test(source)) {
    return { ok: false, error: 'Хязгааргүй давталт илэрлээ. Давталтын нөхцөлөө шалгаарай.', results: [] }
  }

  let fn
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(`"use strict";\n${source}\n;return typeof ${fnName} === "function" ? ${fnName} : null;`)
    fn = factory()
  } catch (e) {
    return { ok: false, error: `Синтаксийн алдаа: ${e.message}`, results: [] }
  }

  if (typeof fn !== 'function') {
    return { ok: false, error: `\`${fnName}\` нэртэй функц олдсонгүй. Функцийн нэрээ шалгаарай.`, results: [] }
  }

  const results = cases.map((c) => {
    const label = `${fnName}(${c.args.map(show).join(', ')})`
    try {
      const got = fn(...structuredCloneSafe(c.args))
      const pass = deepEqual(got, c.expect)
      return { label, pass, got: show(got), expect: show(c.expect) }
    } catch (e) {
      return { label, pass: false, got: `Алдаа: ${e.message}`, expect: show(c.expect) }
    }
  })

  return { ok: results.every((r) => r.pass), error: null, results }
}

function structuredCloneSafe(args) {
  try {
    return JSON.parse(JSON.stringify(args))
  } catch {
    return args
  }
}
