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
  const [lineTop, setLineTop] = useState<number | null>(null)

  // video要素の位置を監視して赤線をビデオ中央に追従させる
  useEffect(() => {
    if (cameraState !== 'active') return
    const container = document.getElementById(containerId)
    if (!container) return

    const updateLine = () => {
      const video = container.querySelector('video')
      if (!video) return
      // html5-qrcodeのインラインスタイルを上書きして右側の白帯を消す
      video.style.width = '100%'
      video.style.height = 'auto'
      const containerRect = container.getBoundingClientRect()
      const videoRect = video.getBoundingClientRect()
      setLineTop(videoRect.top - containerRect.top + videoRect.height / 2)
    }

    const observer = new ResizeObserver(updateLine)
    const video = container.querySelector('video')
    if (video) observer.observe(video)
    updateLine()

    return () => observer.disconnect()
  }, [cameraState])

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
        { fps: 4, qrbox: { width: 220, height: 70 } },
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
      {cameraState === 'active' && lineTop !== null && (
        <div
          className="pointer-events-none absolute left-0 right-0 h-0.5 bg-red-500/60"
          style={{ top: lineTop }}
        />
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
