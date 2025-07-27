"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess?: (code: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [lastScannedUrl, setLastScannedUrl] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const initScanner = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setHasPermission(true);
      stream.getTracks().forEach((track) => track.stop());

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        const backCamera =
          videoDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          ) || videoDevices[0];

        setSelectedDeviceId(backCamera.deviceId);
        startScanning(backCamera.deviceId);
      } else {
        throw new Error("No camera devices found");
      }
    } catch (err) {
      console.error("Scanner initialization error:", err);
      setHasPermission(false);
      setError(
        "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin kamera."
      );
      setIsScanning(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScanner = async () => {
      if (isOpen) {
        await initScanner();
      } else {
        stopScanning();
        setLastScannedUrl(null); // Reset URL saat modal ditutup
      }
    };

    handleScanner();
    return () => {
      stopScanning();
    };
  }, [isOpen, initScanner]);

  const startScanning = async (deviceId: string) => {
    try {
      if (!videoRef.current) return;
      codeReaderRef.current = new BrowserMultiFormatReader();
      await codeReaderRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scannedText = result.getText();
            handleScanResult(scannedText);
          }
          if (error && !(error instanceof NotFoundException)) {
            console.warn("Scan error:", error);
          }
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Start scanning error:", err);
      setError("Gagal memulai scanning. Silakan coba lagi.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === selectedDeviceId
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      const nextDevice = devices[nextIndex];
      stopScanning();
      setSelectedDeviceId(nextDevice.deviceId);
      startScanning(nextDevice.deviceId);
    }
  };

  const handleScanResult = async (scannedText: string) => {
    try {
      let extractedCode = "";
      if (/^[a-f0-9]{12}$/i.test(scannedText)) {
        extractedCode = scannedText.toLowerCase();
      } else if (scannedText.includes("siap.undip.ac.id/a/")) {
        const match = scannedText.match(
          /siap\.undip\.ac\.id\/a\/([a-f0-9]{12})/i
        );
        if (match) extractedCode = match[1].toLowerCase();
      } else {
        const match = scannedText.match(/([a-f0-9]{12})/i);
        if (match) extractedCode = match[1].toLowerCase();
      }

      if (extractedCode) {
        toast.success("QR Code berhasil dipindai!");
        await saveAttendanceHistory(extractedCode);
        onScanSuccess?.(extractedCode);

        // Buka halaman absen UNDIP
        const absenUrl = `https://siap.undip.ac.id/a/${extractedCode}`;
        setLastScannedUrl(absenUrl);

        const newWindow = window.open(absenUrl, "_blank");

        // Fallback jika popup diblokir
        if (!newWindow || newWindow.closed) {
          toast.info(
            "Popup diblokir! Klik tombol 'Buka Halaman Absen' di bawah untuk melanjutkan."
          );
        } else {
          toast.success("Halaman absen telah dibuka di tab baru!");
          onClose();
        }
      } else {
        toast.error(
          "QR Code tidak valid. Pastikan ini adalah QR code absen UNDIP."
        );
      }
    } catch (error) {
      console.error("Handle scan result error:", error);
      toast.error("Terjadi kesalahan saat memproses QR code.");
    }
  };

  const saveAttendanceHistory = async (code: string) => {
    try {
      await fetch("/api/attendance-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          timestamp: new Date().toISOString(),
          url: `https://siap.undip.ac.id/a/${code}`,
        }),
      });
    } catch (error) {
      console.warn("Error saving attendance history:", error);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = async () => {
        try {
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromImage(image);
          const scannedText = result.getText();
          handleScanResult(scannedText);
        } catch (error) {
          console.error("Gagal memindai gambar:", error);
          toast.error("QR code tidak dikenali dari gambar.");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Scan QR Code Absen
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arahkan kamera atau pilih gambar QR
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              <Button onClick={initScanner} className="mt-2 text-sm" size="sm">
                Coba Lagi
              </Button>
            </div>
          )}

          {hasPermission === false && (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Izin Kamera Diperlukan
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Berikan izin akses kamera untuk memindai QR code
              </p>
              <Button onClick={initScanner}>
                <Camera className="w-4 h-4 mr-2" />
                Aktifkan Kamera
              </Button>
            </div>
          )}

          {hasPermission === true && (
            <div>
              <div className="relative bg-gray-900/90 backdrop-blur-sm rounded-lg overflow-hidden mb-4 border border-gray-600/30">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white/60 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  </div>
                </div>
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isScanning ? "Memindai..." : "Menyiapkan kamera..."}
                </p>
                <div className="flex gap-2">
                  {devices.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      size="sm"
                      disabled={!isScanning}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Ganti Kamera
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImagePlus className="w-4 h-4 mr-1" />
                    Import dari Galeri
                  </Button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tombol manual untuk membuka halaman absen jika popup diblokir */}
          {lastScannedUrl && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                QR Code berhasil dipindai! Jika halaman absen tidak terbuka
                otomatis, klik tombol di bawah:
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    window.open(lastScannedUrl, "_blank");
                    setLastScannedUrl(null);
                    onClose();
                  }}
                  className="flex-1"
                  size="sm"
                >
                  🌐 Buka Halaman Absen
                </Button>
                <Button
                  onClick={() => {
                    setLastScannedUrl(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  ✕ Tutup
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
