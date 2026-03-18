import ndcLabels from '@/data/ndc-labels.json'

const { classes, divisions } = ndcLabels as {
  classes: Record<string, string>
  divisions: Record<string, string>
}

export function normalizeNdc(ndc: string): string {
  return ndc.split('.')[0].padEnd(3, '0')
}

export function getNdcLabel(code: string): string | undefined {
  return divisions[code]
}

export function getNdcClassName(classCode: string): string | undefined {
  return classes[classCode]
}

export { classes as ndcClasses, divisions as ndcDivisions }
