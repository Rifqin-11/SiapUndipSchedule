"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Loader2 } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const handleScanner = async () => {
      if (isOpen) {
        await initScanner();
      } else {
        stopScanning();
      }
    };

    handleScanner();

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const initScanner = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera
      });
      setHasPermission(true);

      // Stop the temporary stream
      stream.getTracks().forEach((track) => track.stop());

      // Get available video devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        const backCamera =
          videoDevices.find(
            (device: MediaDeviceInfo) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear")
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
  };

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

  const handleScanResult = async (scannedText: string) => {
    try {
      // Extract code from scanned text
      let extractedCode = "";

      // Check if it's already a code (12 characters alphanumeric)
      if (/^[a-f0-9]{12}$/i.test(scannedText)) {
        extractedCode = scannedText.toLowerCase();
      }
      // Check if it's a full URL
      else if (scannedText.includes("siap.undip.ac.id/a/")) {
        const match = scannedText.match(
          /siap\.undip\.ac\.id\/a\/([a-f0-9]{12})/i
        );
        if (match) {
          extractedCode = match[1].toLowerCase();
        }
      }
      // Check for any 12-character hex string in the text
      else {
        const match = scannedText.match(/([a-f0-9]{12})/i);
        if (match) {
          extractedCode = match[1].toLowerCase();
        }
      }

      if (extractedCode) {
        toast.success("QR Code berhasil dipindai!");

        // Save to history (optional)
        await saveAttendanceHistory(extractedCode);

        // Call success callback
        if (onScanSuccess) {
          onScanSuccess(extractedCode);
        }

        // Redirect to SIAP UNDIP
        const targetUrl = `https://siap.undip.ac.id/a/${extractedCode}`;
        window.open(targetUrl, "_blank");

        // Close scanner
        onClose();
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
      const response = await fetch("/api/attendance-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          timestamp: new Date().toISOString(),
          url: `https://siap.undip.ac.id/a/${code}`,
        }),
      });

      if (!response.ok) {
        console.warn("Failed to save attendance history");
      }
    } catch (error) {
      console.warn("Error saving attendance history:", error);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
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
                Arahkan kamera ke QR code
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

        {/* Scanner Content */}
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
              {/* Camera Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  muted
                  playsInline
                />

                {/* Scan Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Loading indicator */}
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isScanning ? "Memindai..." : "Menyiapkan kamera..."}
                </p>

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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
