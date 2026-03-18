export function normalizeNdc(ndc: string): string {
  return ndc.split('.')[0].padEnd(3, '0')
}
