'use client'

import { getNdcLabel } from '@/lib/ndc'

type NdcFilterProps = {
  ndcList: string[]
  selected: string | null
  onChange: (ndc: string | null) => void
}

export function NdcFilter({ ndcList, selected, onChange }: NdcFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onChange(null)}
        className={`rounded-full border px-3 py-1 text-xs transition-colors ${
          selected === null
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
        }`}
      >
        すべて
      </button>
      {ndcList.map((ndc) => (
        <button
          key={ndc}
          type="button"
          aria-pressed={ndc === selected}
          onClick={() => onChange(ndc)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            ndc === selected
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground'
          }`}
        >
          {ndc} {getNdcLabel(ndc)}
        </button>
      ))}
    </div>
  )
}
