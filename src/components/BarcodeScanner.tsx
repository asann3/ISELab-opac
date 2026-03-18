'use client'

import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useRef } from 'react'

type BarcodeScannerProps = {
  onScan: (isbn: string) => void
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerId = 'barcode-scanner'

  useEffect(() => {
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
      .catch(() => {
        // カメラ権限なし・HTTPS以外の環境では無視
      })

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [onScan])

  return (
    <div className="relative">
      <div id={containerId} className="overflow-hidden rounded-lg" />
      <div className="pointer-events-none absolute inset-0 flex items-center">
        <div className="h-0.5 w-full bg-red-500/60" />
      </div>
    </div>
  )
}
