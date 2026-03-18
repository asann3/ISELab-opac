'use client'

type NdcFilterProps = {
  ndcList: string[]
  selected: string | null
  onChange: (ndc: string | null) => void
}

export function NdcFilter({ ndcList, selected, onChange }: NdcFilterProps) {
  return (
    <div>
      <button type="button">すべて</button>
    </div>
  )
}
