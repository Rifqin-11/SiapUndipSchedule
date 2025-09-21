"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ImagePlus, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ---- BarcodeDetector typing (guard) ----
declare global {
  interface BarcodeDetector {
    detect(
      source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
    ): Promise<DetectedBarcode[]>;
  }
  interface DetectedBarcode {
    boundingBox: DOMRectReadOnly;
    cornerPoints: { x: number; y: number }[];
    format: string;
    rawValue: string;
  }
  const BarcodeDetector: {
    prototype: BarcodeDetector;
    new (options?: { formats: string[] }): BarcodeDetector;
    getSupportedFormats(): Promise<string[]>;
  };
  interface MediaTrackCapabilities {
    zoom?: {
      min: number;
      max: number;
      step: number;
    };
  }
  interface MediaTrackConstraintSet {
    zoom?: number;
  }
}

export default function QRScannerClient() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ZOOM: hardware / digital fallback
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomCaps, setZoomCaps] = useState<{
    min: number;
    max: number;
    step: number;
  } | null>(null);
  const [useCssZoom, setUseCssZoom] = useState(false);

  // lifecycle refs
  const mountedRef = useRef(false); // anti double-init (Strict Mode)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopScanning = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch {}
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        (videoRef.current as any).srcObject = null;
      } catch {}
    }
    setIsScanning(false);
  }, []);

  const handleResult = useCallback(
    (raw: string) => {
      window.dispatchEvent(new CustomEvent("qr:scanned", { detail: raw }));
      toast.success("QR berhasil dipindai!");
      stopScanning();
    },
    [stopScanning]
  );

  const startWithZXing = useCallback(
    async (deviceId: string) => {
      if (!videoRef.current) return;
      codeReaderRef.current = new BrowserMultiFormatReader();
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, err) => {
          if (result) handleResult(result.getText());
          if (err && !(err instanceof NotFoundException)) console.warn(err);
        }
      );
      setIsScanning(true);
    },
    [handleResult]
  );

  const startWithBarcodeDetector = useCallback(async () => {
    if (typeof BarcodeDetector === "undefined") return false;
    try {
      barcodeDetectorRef.current = new BarcodeDetector({
        formats: ["qr_code"],
      });
      const loop = async () => {
        if (!videoRef.current) return;
        const res = await barcodeDetectorRef.current!.detect(videoRef.current);
        const qr = res.find((b) => b.format === "qr_code" && b.rawValue);
        if (qr?.rawValue) handleResult(qr.rawValue);
      };
      detectionIntervalRef.current = setInterval(loop, 80);
      setIsScanning(true);
      return true;
    } catch (e) {
      console.warn("BarcodeDetector unsupported/error, fallback ke ZXing", e);
      return false;
    }
  }, [handleResult]);

  const initScanner = useCallback(async () => {
    try {
      setError(null);
      stopScanning();

      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter((d) => d.kind === "videoinput");
      setDevices(cams);
      const prefer =
        cams.find((d) => /back|rear|environment/i.test(d.label)) || cams[0];
      if (!prefer) throw new Error("Kamera tidak ditemukan");
      setSelectedDeviceId(prefer.deviceId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: prefer.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) (videoRef.current as any).srcObject = stream;

      // Zoom capability
      const track = stream.getVideoTracks()[0];
      const caps = track?.getCapabilities?.();
      if (caps?.zoom) {
        const min = caps.zoom.min ?? 1;
        const max = caps.zoom.max ?? 3;
        const step = caps.zoom.step ?? 0.1;
        setZoomCaps({ min, max, step });
        setUseCssZoom(false);
        setZoomLevel(Math.max(1, min));
      } else {
        setZoomCaps({ min: 1, max: 3, step: 0.1 }); // fallback digital
        setUseCssZoom(true);
        setZoomLevel(1);
      }

      const ok = await startWithBarcodeDetector();
      if (!ok) await startWithZXing(prefer.deviceId);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Tidak dapat mengakses kamera");
      setIsScanning(false);
    }
  }, [startWithBarcodeDetector, startWithZXing, stopScanning]);

  const handleZoomChange = useCallback(
    async (value: number[]) => {
      const z = value[0];
      setZoomLevel(z);
      if (!useCssZoom) {
        const track = streamRef.current?.getVideoTracks?.()[0];
        const caps = track?.getCapabilities?.();
        if (track && caps?.zoom) {
          try {
            await track.applyConstraints({ advanced: [{ zoom: z }] });
          } catch {}
        }
      }
    },
    [useCssZoom]
  );

  const switchCamera = useCallback(async () => {
    if (devices.length < 2) {
      toast.info("Hanya 1 kamera tersedia");
      return;
    }
    const idx = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const next = devices[(idx + 1) % devices.length];
    stopScanning();
    setSelectedDeviceId(next.deviceId);
    await initScanner();
    toast.info(`Beralih ke kamera: ${next.label || "Device"}`);
  }, [devices, selectedDeviceId, initScanner, stopScanning]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    initScanner();
    return () => stopScanning();
  }, [initScanner, stopScanning]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result as string;
      await new Promise((res) => {
        img.onload = () => res(null);
      });
      try {
        if (typeof BarcodeDetector !== "undefined") {
          const det = new BarcodeDetector({ formats: ["qr_code"] });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const found = await det.detect(canvas);
          const qr = found.find((f) => f.format === "qr_code" && f.rawValue);
          if (qr?.rawValue) return handleResult(qr.rawValue);
        }
        const zx = new BrowserMultiFormatReader();
        const r = await zx.decodeFromImage(img as any);
        handleResult(r.getText());
      } catch {
        toast.error("QR tidak ditemukan pada gambar");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* VIDEO (digital zoom pakai CSS transform jika perlu) */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover will-change-transform"
        style={
          useCssZoom
            ? {
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }
            : undefined
        }
        autoPlay
        muted
        playsInline
      />

      {/* HEADER BAR: Back / QR Scanner / Upload bulat */}
      <div className="absolute top-0 inset-x-0 z-20 p-3">
        <div className="mx-auto w-full flex items-center justify-between">
          {/* Back */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white border-0 backdrop-blur-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title */}
          <div className="px-3 py-1 rounded-full bg-black/40 text-white text-sm font-semibold backdrop-blur-md">
            QR Scanner
          </div>

          {/* Upload (ikon bulat) */}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={() => galleryInputRef.current?.click()}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white border-0 backdrop-blur-md"
            title="Upload gambar QR"
          >
            <ImagePlus className="h-5 w-5" />
          </Button>

          {/* Hidden file input */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Frame */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className={`relative h-56 w-56 rounded-xl border-2 ${
            isScanning ? "border-white/80 animate-pulse" : "border-white/50"
          }`}
        >
          <div className="absolute -top-0 -left-0 h-6 w-6 rounded-tl-xl border-t-4 border-l-4 border-blue-400" />
          <div className="absolute -top-0 -right-0 h-6 w-6 rounded-tr-xl border-t-4 border-r-4 border-blue-400" />
          <div className="absolute -bottom-0 -left-0 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-blue-400" />
          <div className="absolute -bottom-0 -right-0 h-6 w-6 rounded-br-xl border-b-4 border-r-4 border-blue-400" />
        </div>
      </div>

      {/* Switch camera (opsional) */}
      {devices.length > 1 && (
        <div className="absolute right-4 top-1/2 -translate-y-[calc(50%+96px)] z-10">
          <Button
            size="icon"
            variant="secondary"
            onClick={switchCamera}
            disabled={!isScanning}
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white border-0 backdrop-blur-md"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Slider zoom center-right */}
      {zoomCaps && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-lg bg-black/60 p-3">
          <Slider
            value={[zoomLevel]}
            onValueChange={handleZoomChange}
            min={zoomCaps.min}
            max={zoomCaps.max}
            step={zoomCaps.step}
            orientation="vertical"
            className="h-28 w-6"
          />
        </div>
      )}

      {!isScanning && (
        <div className="absolute inset-0 grid place-items-center bg-black/40">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {error && (
        <div className="absolute left-1/2 top-6 z-10 w-[90%] -translate-x-1/2">
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button size="sm" onClick={initScanner}>
                Coba lagi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
