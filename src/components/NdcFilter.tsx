'use client'

import { getNdcLabel } from '@/lib/ndc'

type NdcFilterProps = {
  ndcList: string[]
  selected: string | null
  onChange: (ndc: string | null) => void
}

export function NdcFilter({ ndcList, selected, onChange }: NdcFilterProps) {
  return (
    <div>
      <button type="button" onClick={() => onChange(null)}>すべて</button>
      {ndcList.map((ndc) => (
        <button key={ndc} type="button" onClick={() => onChange(ndc)}>
          {ndc} {getNdcLabel(ndc)}
        </button>
      ))}
    </div>
  )
}
