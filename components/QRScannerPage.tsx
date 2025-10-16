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

  // Tambahan agar TS kenal zoom capability
  interface MediaTrackCapabilities {
    zoom?: { min: number; max: number; step: number };
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
  const [isVideoReady, setIsVideoReady] = useState(false);

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
    setIsProcessing(false);
    setIsVideoReady(false);
  }, []);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleResult = useCallback(
    (raw: string) => {
      // Prevent multiple scans
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        window.dispatchEvent(new CustomEvent("qr:scanned", { detail: raw }));
        toast.success("QR berhasil dipindai!");
        stopScanning();
      } catch (err) {
        console.error("Error handling QR result:", err);
        toast.error("Gagal memproses QR code");
        setIsProcessing(false);
      }
    },
    [isProcessing, stopScanning]
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
        if (!videoRef.current || !barcodeDetectorRef.current) return;
        try {
          const results = await barcodeDetectorRef.current.detect(
            videoRef.current
          );
          const qrCode = results.find(
            (b) => b.format === "qr_code" && b.rawValue
          );
          if (qrCode?.rawValue) {
            handleResult(qrCode.rawValue);
          }
        } catch (err) {
          // Ignore errors during detection (e.g., video not ready)
          console.debug("Detection error:", err);
        }
      };

      detectionIntervalRef.current = setInterval(loop, 100);
      setIsScanning(true);
      return true;
    } catch (err) {
      console.warn("BarcodeDetector initialization failed:", err);
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

      let targetDevice: MediaDeviceInfo | undefined;
      if (selectedDeviceId) {
        targetDevice = cams.find((d) => d.deviceId === selectedDeviceId);
      }
      if (!targetDevice) {
        targetDevice =
          cams.find((d) => /back|rear|environment/i.test(d.label)) || cams[0];
      }
      if (!targetDevice) throw new Error("Kamera tidak ditemukan");

      setSelectedDeviceId(targetDevice.deviceId);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: targetDevice.deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        (videoRef.current as any).srcObject = stream;

        // Wait for video to be fully ready (multiple events)
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();

          let metadataLoaded = false;
          let canPlay = false;

          const checkReady = () => {
            if (metadataLoaded && canPlay) {
              setIsVideoReady(true);
              resolve();
            }
          };

          videoRef.current.onloadedmetadata = () => {
            metadataLoaded = true;
            checkReady();
          };

          videoRef.current.oncanplay = () => {
            canPlay = true;
            checkReady();
          };

          // Fallback timeout
          setTimeout(() => {
            if (!metadataLoaded || !canPlay) {
              console.warn("Video ready timeout, proceeding anyway");
              setIsVideoReady(true);
              resolve();
            }
          }, 2000);
        });

        // Additional delay to ensure video is actually rendering
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Zoom capability
      const track: any = stream.getVideoTracks()[0];
      const caps: MediaTrackCapabilities | undefined =
        track?.getCapabilities?.();
      if (caps?.zoom) {
        const min = caps.zoom.min ?? 1;
        const max = caps.zoom.max ?? 3;
        const step = caps.zoom.step ?? 0.1;
        setZoomCaps({ min, max, step });
        setUseCssZoom(false);
        setZoomLevel(Math.max(1, min));
      } else {
        setZoomCaps({ min: 1, max: 3, step: 0.1 });
        setUseCssZoom(true);
        setZoomLevel(1);
      }

      const ok = await startWithBarcodeDetector();
      if (!ok) await startWithZXing(targetDevice.deviceId);
    } catch (e: any) {
      console.error("initScanner error:", e);
      setError(e?.message || "Tidak dapat mengakses kamera");
      setIsScanning(false);
    }
  }, [
    selectedDeviceId,
    startWithBarcodeDetector,
    startWithZXing,
    stopScanning,
  ]);

  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleZoomChange = useCallback(
    async (value: number[]) => {
      const z = value[0];
      setZoomLevel(z);

      if (!useCssZoom && isVideoReady) {
        // Clear previous timeout
        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current);
        }

        // Debounce hardware zoom changes
        zoomTimeoutRef.current = setTimeout(async () => {
          const track: any = streamRef.current?.getVideoTracks?.()[0];
          const caps: MediaTrackCapabilities | undefined =
            track?.getCapabilities?.();
          if (track && caps?.zoom) {
            try {
              await track.applyConstraints({ advanced: [{ zoom: z }] });
            } catch (err) {
              console.warn("Zoom constraint failed:", err);
            }
          }
        }, 50); // 50ms debounce
      }
    },
    [useCssZoom, isVideoReady]
  );

  const switchCamera = useCallback(async () => {
    if (devices.length < 2) {
      toast.info("Hanya 1 kamera tersedia");
      return;
    }

    try {
      const idx = devices.findIndex((d) => d.deviceId === selectedDeviceId);
      const next = devices[(idx + 1) % devices.length];

      stopScanning();
      setSelectedDeviceId(next.deviceId);

      // Use timeout to ensure state update
      setTimeout(async () => {
        await initScanner();
        toast.info(`Beralih ke: ${next.label || "Kamera lain"}`);
      }, 100);
    } catch (err) {
      console.error("Switch camera error:", err);
      toast.error("Gagal beralih kamera");
    }
  }, [devices, selectedDeviceId, initScanner, stopScanning]);

  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if (mountedRef.current) return;
    mountedRef.current = true;

    const initialize = async () => {
      try {
        // Request permission first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());

        // Then enumerate devices
        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter((d) => d.kind === "videoinput");
        setDevices(cams);

        if (cams.length > 0) {
          const backCamera =
            cams.find((d) => /back|rear|environment/i.test(d.label)) || cams[0];
          setSelectedDeviceId(backCamera.deviceId);
          await initScanner();
        } else {
          setError("Tidak ada kamera yang tersedia");
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setError(err.message || "Tidak dapat mengakses kamera");
      }
    };

    initialize();

    return () => {
      mountedRef.current = false;
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
      stopScanning();
    };
  }, [initScanner, stopScanning]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show loading toast
    const loadingToast = toast.loading("Memproses gambar...");

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        const reader = new FileReader();

        reader.onload = (event) => {
          image.src = event.target?.result as string;
        };

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Gagal memuat gambar"));

        reader.onerror = () => reject(new Error("Gagal membaca file"));
        reader.readAsDataURL(file);
      });

      // Try BarcodeDetector first (if available)
      if (typeof BarcodeDetector !== "undefined") {
        try {
          const detector = new BarcodeDetector({ formats: ["qr_code"] });
          const barcodes = await detector.detect(img);
          const qrCode = barcodes.find(
            (barcode) => barcode.format === "qr_code" && barcode.rawValue
          );

          if (qrCode?.rawValue) {
            toast.dismiss(loadingToast);
            handleResult(qrCode.rawValue);
            // Reset input value so same file can be selected again
            if (galleryInputRef.current) galleryInputRef.current.value = "";
            return;
          }
        } catch (err) {
          console.warn("BarcodeDetector failed, trying ZXing:", err);
        }
      }

      // Fallback to ZXing
      try {
        const codeReader = new BrowserMultiFormatReader();
        const result = await codeReader.decodeFromImageElement(img);
        toast.dismiss(loadingToast);
        handleResult(result.getText());
        // Reset input value
        if (galleryInputRef.current) galleryInputRef.current.value = "";
      } catch (err) {
        console.error("ZXing decode error:", err);
        toast.dismiss(loadingToast);
        toast.error("QR code tidak ditemukan pada gambar");
      }
    } catch (err: any) {
      console.error("Image upload error:", err);
      toast.dismiss(loadingToast);
      toast.error(err.message || "Gagal memproses gambar");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-black"
      style={{
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
      }}
    >
      {/* VIDEO (digital zoom pakai CSS transform jika perlu) */}
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        style={{
          transform: useCssZoom ? `scale(${zoomLevel})` : undefined,
          transformOrigin: "center center",
          willChange: useCssZoom ? "transform" : undefined,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          opacity: isVideoReady ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
        autoPlay
        muted
        playsInline
        onError={(e) => {
          console.error("Video error:", e);
          setError("Gagal memutar video kamera");
        }}
        onLoadedMetadata={() => {
          console.log("Video metadata loaded");
        }}
        onCanPlay={() => {
          console.log("Video can play");
        }}
      />

      {/* HEADER: Back | QR Scanner | (Upload, Switch) */}
      <div className="absolute top-0 inset-x-0 z-20 p-3">
        <div className="mx-auto w-full max-w-xl grid grid-cols-3 items-center">
          {/* Back (kiri) */}
          <div className="justify-self-start">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => {
                stopScanning();
                router.back();
              }}
              className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white border-0 backdrop-blur-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Title (selalu center) */}
          <div className="justify-self-center">
            <div className="px-3 py-1 rounded-full bg-black/40 text-white text-sm font-semibold backdrop-blur-md">
              QR Scanner
            </div>
          </div>

          {/* Actions (kanan) */}
          <div className="justify-self-end flex items-center gap-2">
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

            {devices.length > 1 && (
              <Button
                size="icon"
                variant="secondary"
                onClick={switchCamera}
                disabled={!isScanning}
                className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white border-0 backdrop-blur-md"
                title="Ganti kamera"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            )}
          </div>

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

      {/* Slider zoom center-right (tidak tabrakan sheet) */}
      {zoomCaps && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 rounded-lg bg-black/60 p-3">
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

      {(!isScanning || !isVideoReady) && (
        <div className="absolute inset-0 grid place-items-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
            <p className="text-sm text-white/80">
              {!isVideoReady ? "Memuat kamera..." : "Memulai scanner..."}
            </p>
          </div>
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
