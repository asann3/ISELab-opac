'use client'

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'

type BarcodeScannerProps = {
  onScan: (isbn: string) => void
}

type CameraState = 'starting' | 'active' | 'denied' | 'unavailable'

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'barcode-scanner'
  const [cameraState, setCameraState] = useState<CameraState>('starting')
  const [retryKey, setRetryKey] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryKey is intentionally used as a re-run trigger
  useEffect(() => {
    setCameraState('starting')
    const scanner = new Html5Qrcode(containerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
      verbose: false,
    })
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 4, qrbox: { width: 300, height: 100 } },
        (decodedText) => {
          onScan(decodedText)
        },
        undefined,
      )
      .then(() => {
        setCameraState('active')
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        if (
          msg.toLowerCase().includes('permission') ||
          msg.toLowerCase().includes('denied') ||
          msg.toLowerCase().includes('notallowed')
        ) {
          setCameraState('denied')
        } else {
          setCameraState('unavailable')
        }
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan, retryKey])

  return (
    <div className="relative">
      <div id={containerId} className="overflow-hidden rounded-lg" />
      {cameraState === 'active' && (
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="h-0.5 w-full bg-red-500/60" />
        </div>
      )}
      {cameraState === 'denied' && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <p>カメラへのアクセスが拒否されました。</p>
          <p className="text-xs">
            iOSの場合: 設定 &gt; Safari &gt; カメラ
            で「許可」に変更してください。
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-1 rounded-md border px-3 py-1 text-xs"
          >
            再試行
          </button>
        </div>
      )}
      {cameraState === 'unavailable' && (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          <p>カメラを起動できませんでした。</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-1 rounded-md border px-3 py-1 text-xs"
          >
            再試行
          </button>
        </div>
      )}
    </div>
  )
}
