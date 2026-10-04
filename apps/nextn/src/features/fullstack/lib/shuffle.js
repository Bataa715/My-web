/**
 * Тогтмол seed-тэй холигч — ижил дасгал үргэлж ижил байрлалтай гарна.
 * (Дахин render болгонд хариултууд үсрэхгүй байх нь чухал.)
 */
export function shuffled(arr, seed) {
  const a = [...arr]
  let s = seed
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** order дасгалын эхний байрлалыг тооцох seed */
export const orderSeed = (ex) => ex.items.length * 31 + ex.q.length

/** blank дасгалын word bank-ийн seed */
export const bankSeed = (ex) => ex.q.length * 7 + 3

/** match дасгалын баруун баганын seed */
export const matchSeed = (ex) => ex.pairs.length * 17 + 5

/** Анхны дараалалтай ЯГ ижил гарахаас зайлсхийсэн холилт (order, match-д) */
export function shuffledDistinct(arr, seed) {
  if (arr.length < 2) return [...arr]
  for (let k = 0; k < 24; k++) {
    const out = shuffled(arr, seed + k * 7919)
    if (out.some((x, i) => x !== arr[i])) return out
  }
  return [...arr].reverse()
}

/** Зөв хариулт эхний байрлалд орохоос зайлсхийсэн word bank */
export function shuffledBank(bank, answer, seed) {
  if (bank.length < 2) return [...bank]
  for (let k = 0; k < 24; k++) {
    const out = shuffled(bank, seed + k * 7919)
    if (out[0] !== answer) return out
  }
  return [...bank].reverse()
}
