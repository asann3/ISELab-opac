import ndcLabels from '@/data/ndc-labels.json'

export function normalizeNdc(ndc: string): string {
  return ndc.split('.')[0].padEnd(3, '0')
}

export function getNdcLabel(code: string): string | undefined {
  return (ndcLabels as Record<string, string>)[code]
}
