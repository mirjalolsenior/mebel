
export function fmtNumber(n: number | null | undefined) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('uz-UZ').format(n)
}
