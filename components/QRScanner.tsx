"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  X,
  RotateCcw,
  Loader2,
  ImagePlus,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [lastScannedUrl, setLastScannedUrl] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(50);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeDetectorRef = useRef<BarcodeDetector | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced browser compatibility check
  const checkBrowserSupport = useCallback(() => {
    const hasGetUserMedia = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    const hasCamera = "ImageCapture" in window;
    const hasWebRTC = !!(
      window.RTCPeerConnection ||
      (window as Window & { webkitRTCPeerConnection?: unknown })
        .webkitRTCPeerConnection
    );
    const hasBarcodeDetector = "BarcodeDetector" in window;

    return {
      isSupported: hasGetUserMedia && hasWebRTC,
      features: {
        getUserMedia: hasGetUserMedia,
        camera: hasCamera,
        webRTC: hasWebRTC,
        barcodeDetector: hasBarcodeDetector,
      },
    };
  }, []);

  // Enhanced camera permission check
  const checkCameraPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return permission.state;
    } catch (_error) {
      console.error("Permission check failed:", _error);
      return "unknown";
    }
  }, []);

  // QR Code validation
  const validateQRCode = useCallback((decodedText: string) => {
    try {
      // Check if it's a valid attendance code format
      if (/^[a-f0-9]{12}$/i.test(decodedText)) {
        return { isValid: true, data: { code: decodedText.toLowerCase() } };
      }

      // Check if it's a UNDIP attendance URL
      if (decodedText.includes("siap.undip.ac.id/a/")) {
        const match = decodedText.match(
          /siap\.undip\.ac\.id\/a\/([a-f0-9]{12})/i
        );
        if (match) {
          return { isValid: true, data: { code: match[1].toLowerCase() } };
        }
      }

      // Check for any 12-character hex string
      const match = decodedText.match(/([a-f0-9]{12})/i);
      if (match) {
        return { isValid: true, data: { code: match[1].toLowerCase() } };
      }

      // Try to parse as JSON for other formats
      const data = JSON.parse(decodedText);
      if (data.type === "attendance" && data.code) {
        return { isValid: true, data };
      }

      return { isValid: false, error: "Invalid QR code format" };
    } catch {
      // If not JSON, treat as plain text and try to extract code
      const match = decodedText.match(/([a-f0-9]{12})/i);
      if (match) {
        return { isValid: true, data: { code: match[1].toLowerCase() } };
      }
      return { isValid: false, error: "QR code format not recognized" };
    }
  }, []);

  // BarcodeDetector scanning function - enhanced for better detection
  const scanWithBarcodeDetector = useCallback(
    async (video: HTMLVideoElement) => {
      if (
        !barcodeDetectorRef.current ||
        !video.videoWidth ||
        !video.videoHeight
      )
        return;

      try {
        // Try multiple detection approaches for better accuracy
        const barcodes = await barcodeDetectorRef.current.detect(video);

        for (const barcode of barcodes) {
          if (barcode.format === "qr_code" && barcode.rawValue) {
            console.log("BarcodeDetector QR detected:", barcode.rawValue);

            const validation = validateQRCode(barcode.rawValue);
            if (validation.isValid) {
              // Stop detection and handle result
              if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
              }
              return barcode.rawValue;
            }
          }
        }

        // If no QR codes found, try with a canvas for enhanced contrast
        if (barcodes.length === 0) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);

            // Apply contrast enhancement
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
              // Increase contrast for better QR detection
              const gray =
                data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
              const enhanced = Math.min(
                255,
                Math.max(0, (gray - 128) * 1.5 + 128)
              );
              data[i] = enhanced;
              data[i + 1] = enhanced;
              data[i + 2] = enhanced;
            }

            ctx.putImageData(imageData, 0, 0);

            // Try detection on enhanced canvas
            const enhancedBarcodes = await barcodeDetectorRef.current.detect(
              canvas
            );
            for (const barcode of enhancedBarcodes) {
              if (barcode.format === "qr_code" && barcode.rawValue) {
                console.log(
                  "Enhanced BarcodeDetector QR detected:",
                  barcode.rawValue
                );
                const validation = validateQRCode(barcode.rawValue);
                if (validation.isValid) {
                  if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current);
                    detectionIntervalRef.current = null;
                  }
                  return barcode.rawValue;
                }
              }
            }
          }
        }
      } catch (error) {
        console.warn("BarcodeDetector scan failed:", error);
        // Switch to fallback if BarcodeDetector fails consistently
        if (!useFallback) {
          console.log("Switching to ZXing fallback...");
          setUseFallback(true);
        }
      }
      return null;
    },
    [validateQRCode, useFallback, setUseFallback]
  );

  // Check if camera device is available and not in use
  const checkDeviceAvailability = useCallback(async (deviceId: string) => {
    try {
      // Try to get a minimal stream to test availability
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
      });

      // Immediately stop the test stream
      testStream.getTracks().forEach((track) => track.stop());

      return true;
    } catch (error) {
      console.log(`Device ${deviceId} is not available:`, error);
      return false;
    }
  }, []);

  // Enhanced video stream configuration
  const enhanceVideoStream = useCallback(
    (stream: MediaStream) => {
      try {
        console.log("Enhancing video stream...");

        // Cleanup previous stream first
        if (streamRef.current && streamRef.current !== stream) {
          streamRef.current.getTracks().forEach((track) => {
            if (track.readyState === "live") {
              track.stop();
            }
          });
        }

        if (!stream || !stream.active) {
          throw new Error("Invalid stream provided");
        }

        streamRef.current = stream;
        const track = stream.getVideoTracks()[0];

        if (!track || track.readyState !== "live") {
          throw new Error("No active video track available");
        }

        // Set video element source
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if ("getCapabilities" in track) {
          try {
            const capabilities = track.getCapabilities() as Record<
              string,
              unknown
            >;

            const constraints: Record<string, unknown> = {};

            if (
              capabilities.focusMode &&
              Array.isArray(capabilities.focusMode) &&
              (capabilities.focusMode as string[]).includes("continuous")
            ) {
              constraints.focusMode = "continuous";
            }

            if (
              capabilities.exposureMode &&
              Array.isArray(capabilities.exposureMode) &&
              (capabilities.exposureMode as string[]).includes("continuous")
            ) {
              constraints.exposureMode = "continuous";
            }

            if (
              capabilities.whiteBalanceMode &&
              Array.isArray(capabilities.whiteBalanceMode) &&
              (capabilities.whiteBalanceMode as string[]).includes("continuous")
            ) {
              constraints.whiteBalanceMode = "continuous";
            }

            // Don't apply zoom during stream initialization to prevent conflicts
            // Zoom will be handled separately by handleZoomChange
            // if (capabilities.zoom && zoomLevel !== 1) {
            //   const zoomRange = capabilities.zoom as {
            //     max?: number;
            //     min?: number;
            //   };
            //   const maxZoom = zoomRange.max || 3;
            //   const minZoom = zoomRange.min || 1;
            //   constraints.zoom = Math.min(
            //     Math.max(zoomLevel, minZoom),
            //     maxZoom
            //   );
            // }

            // Only apply constraints if track is still live
            if (
              track.readyState === "live" &&
              Object.keys(constraints).length > 0
            ) {
              track.applyConstraints(constraints).catch((error) => {
                console.warn("Failed to apply video constraints:", error);
              });
            }
          } catch (constraintError) {
            console.warn(
              "Failed to apply camera constraints:",
              constraintError
            );
          }
        }

      } catch (error) {
        console.error("Failed to enhance video stream:", error);
        throw error;
      }
    },
    [] // Removed zoomLevel dependency to prevent camera restart
  );

  // Brightness detection for auto-adjustment
  const detectLighting = useCallback(
    (video: HTMLVideoElement) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx || !video.videoWidth || !video.videoHeight) return 50;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        const avgBrightness = brightness / (data.length / 4);
        setBrightness(avgBrightness);
        return avgBrightness;
      } catch (error) {
        console.warn("Brightness detection failed:", error);
        return 50;
      }
    },
    [setBrightness]
  );

  // Zoom functions - simplified to prevent camera restart
  const handleZoomChange = useCallback(async (value: number[]) => {
    const newZoomLevel = value[0];
    setZoomLevel(newZoomLevel);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && track.readyState === "live" && "getCapabilities" in track) {
        try {
          const capabilities = track.getCapabilities() as Record<
            string,
            unknown
          >;
          if (capabilities.zoom) {
            const zoomRange = capabilities.zoom as {
              max?: number;
              min?: number;
            };
            const maxZoom = zoomRange.max || 3;
            const minZoom = zoomRange.min || 1;
            const clampedZoom = Math.min(
              Math.max(newZoomLevel, minZoom),
              maxZoom
            );

            // Use simple applyConstraints without advanced array
            await track.applyConstraints({
              advanced: [{ zoom: clampedZoom } as MediaTrackConstraintSet],
            });
          }
        } catch (error) {
          console.warn("Failed to apply zoom:", error);
        }
      }
    }
  }, []);

  const zoomIn = useCallback(async () => {
    const newZoomLevel = Math.min(zoomLevel + 0.5, 3);
    handleZoomChange([newZoomLevel]);
  }, [zoomLevel, handleZoomChange]);

  const zoomOut = useCallback(async () => {
    const newZoomLevel = Math.max(zoomLevel - 0.5, 1);
    handleZoomChange([newZoomLevel]);
  }, [zoomLevel, handleZoomChange]);

  // Manual QR code input handler (moved after handleScanResult)
  const saveAttendanceHistory = useCallback(async (code: string) => {
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
  }, []);

  const initScanner = useCallback(async () => {
    try {
      setError(null);
      setIsScanning(false);
      setRetryCount(0);

      // Stop any existing streams first
      stopScanning();

      // Check browser support first
      const browserSupport = checkBrowserSupport();
      if (!browserSupport.isSupported) {
        throw new Error(
          "Browser tidak mendukung kamera. Gunakan browser yang lebih baru."
        );
      }

      // Check permissions
      const permissionState = await checkCameraPermission();
      if (permissionState === "denied") {
        throw new Error(
          "Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser."
        );
      }

      // Enhanced constraints for better QR reading
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: {
            ideal: isMobile ? 1280 : 1920,
            min: 640,
          },
          height: {
            ideal: isMobile ? 720 : 1080,
            min: 480,
          },
          frameRate: { ideal: 30, min: 15 },
          ...(isIOS && {
            aspectRatio: 1.777777778,
            resizeMode: "crop-and-scale",
          }),
        },
      };

      // Request camera stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setHasPermission(true);

      // Get available devices first
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);

      if (videoDevices.length > 0) {
        // Prefer back camera for better QR scanning
        const backCamera =
          videoDevices.find(
            (device) =>
              device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear") ||
              device.label.toLowerCase().includes("environment")
          ) || videoDevices[videoDevices.length - 1]; // Last camera is usually back camera

        // Check if preferred camera is available
        const isAvailable = await checkDeviceAvailability(backCamera.deviceId);

        if (isAvailable) {
          setSelectedDeviceId(backCamera.deviceId);

          // Stop initial stream and start with selected device
          stream.getTracks().forEach((track) => track.stop());

          // Wait a bit before starting scanner to ensure cleanup
          setTimeout(() => {
            if (backCamera.deviceId) {
              startScanning(backCamera.deviceId);
            }
          }, 500); // Increased delay for better camera release
        } else {
          // Try other available cameras
          let foundAvailableCamera = false;
          for (const device of videoDevices) {
            if (await checkDeviceAvailability(device.deviceId)) {
              setSelectedDeviceId(device.deviceId);
              stream.getTracks().forEach((track) => track.stop());
              setTimeout(() => startScanning(device.deviceId), 500);
              foundAvailableCamera = true;
              break;
            }
          }

          if (!foundAvailableCamera) {
            throw new Error(
              "All cameras are being used by other applications."
            );
          }
        }
      } else {
        throw new Error("No camera found on this device.");
      }
    } catch (err: unknown) {
      console.error("Scanner initialization error:", err);
      setHasPermission(false);
      setError(
        err instanceof Error
          ? err.message
          : "Cannot access camera. Please grant camera permission."
      );
      setIsScanning(false);

      // Increment retry count and suggest alternatives
      setRetryCount((prev) => prev + 1);
      if (retryCount >= 2) {
        setShowManualInput(true);
        toast.info("Having trouble accessing camera? Try manual input below.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    facingMode,
    retryCount,
  ]); // Reduced dependencies to prevent constant re-creation

  const stopScanning = useCallback(() => {
    // Early return if scanner is not running to prevent unnecessary calls
    if (!streamRef.current && !codeReaderRef.current && !detectionIntervalRef.current) {
      return;
    }

    // Reset zoom level
    setZoomLevel(1);    // Stop BarcodeDetector interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    // Stop code reader first
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (error) {
        console.warn("Error stopping code reader:", error);
      } finally {
        codeReaderRef.current = null;
      }
    }

    // Stop video stream with more robust cleanup
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
          }
        });
      } catch (error) {
        console.warn("Error stopping video tracks:", error);
      } finally {
        streamRef.current = null;
      }
    }

    // Clear video element source
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (error) {
        console.warn("Error clearing video element:", error);
      }
    }

    setIsScanning(false);
  }, []);

  // useEffect for handling scanner lifecycle
  useEffect(() => {
    let isMounted = true;

    const handleScanner = async () => {
      if (!isMounted) return;

      if (isOpen) {
        await initScanner();
      } else {
        // Only call stopScanning if there's actually something to stop
        if (streamRef.current || codeReaderRef.current || detectionIntervalRef.current || isScanning) {
          stopScanning();
          setLastScannedUrl(null);
        }
      }
    };

    handleScanner();

    return () => {
      isMounted = false;
      // Only cleanup if there's actually something to clean
      if (streamRef.current || codeReaderRef.current || detectionIntervalRef.current) {
        stopScanning();
      }
    };
  }, [isOpen]); // Only depend on isOpen to prevent infinite loops

  const startScanning = useCallback(
    async (deviceId: string) => {
      try {
        if (!videoRef.current) return;

        // Ensure any existing streams are completely stopped first
        stopScanning();

        // Wait longer for cleanup to complete and camera to be released
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if video element is still available after cleanup
        if (!videoRef.current) {
          return;
        }

        // Try multiple constraint strategies
        const constraintStrategies = [
          // Strategy 1: High quality with exact device
          {
            video: {
              deviceId: { exact: deviceId },
              width: { ideal: 1920, min: 640 },
              height: { ideal: 1080, min: 480 },
              frameRate: { ideal: 30, min: 15 },
            },
          },
          // Strategy 2: Medium quality with ideal device
          {
            video: {
              deviceId: { ideal: deviceId },
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
              frameRate: { ideal: 25, min: 10 },
            },
          },
          // Strategy 3: Basic quality with any device
          {
            video: {
              width: { ideal: 1280, min: 640 },
              height: { ideal: 720, min: 480 },
            },
          },
          // Strategy 4: Minimal constraints
          {
            video: true,
          },
        ];

        let stream: MediaStream | null = null;
        let lastError: Error | null = null;

        for (let i = 0; i < constraintStrategies.length; i++) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(
              constraintStrategies[i]
            );

            // Verify stream is active before proceeding
            if (stream && stream.active && stream.getVideoTracks().length > 0) {
              break;
            } else {
              stream?.getTracks().forEach((track) => track.stop());
              stream = null;
            }
          } catch (error) {
            lastError = error as Error;
            // Wait a bit before trying next strategy
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        }

        if (!stream) {
          throw (
            lastError ||
            new Error("Unable to access camera with any constraints")
          );
        }

        enhanceVideoStream(stream);

        // Check for BarcodeDetector support and initialize
        const browserSupport = checkBrowserSupport();

        if (browserSupport.features.barcodeDetector && !useFallback) {
          try {
            console.log("Initializing BarcodeDetector...");
            barcodeDetectorRef.current = new BarcodeDetector({
              formats: ["qr_code"],
            });

            // Start BarcodeDetector scanning - increased frequency for better detection
            detectionIntervalRef.current = setInterval(async () => {
              if (videoRef.current && videoRef.current.videoWidth > 0) {
                const result = await scanWithBarcodeDetector(videoRef.current);
                if (result) {
                  // Use ref to avoid circular dependency
                  setTimeout(() => {
                    if (handleScanResultRef.current) {
                      handleScanResultRef.current(result);
                    }
                  }, 0);
                  return;
                }
              }
            }, 50); // Increased frequency: scan every 50ms instead of 100ms

            console.log("BarcodeDetector scanning started");
          } catch (barcodeError) {
            console.warn(
              "BarcodeDetector initialization failed, using ZXing:",
              barcodeError
            );
            setUseFallback(true);
          }
        }

        // Use ZXing as fallback or primary if BarcodeDetector not available
        if (!browserSupport.features.barcodeDetector || useFallback) {
          console.log("Using ZXing fallback...");

          // Initialize enhanced code reader with better sensitivity
          codeReaderRef.current = new BrowserMultiFormatReader();

          // Configure reader with enhanced hints for better QR detection
          const hints = new Map();
          hints.set("TRY_HARDER", true);
          hints.set("POSSIBLE_FORMATS", ["QR_CODE"]);
          hints.set("CHARACTER_SET", "UTF-8");
          hints.set("PURE_BARCODE", false); // Allow detection even with some noise
          hints.set("ASSUME_GS1", false);

          await codeReaderRef.current.decodeFromVideoDevice(
            deviceId,
            videoRef.current,
            (result, error) => {
              if (result) {
                const scannedText = result.getText();
                console.log("ZXing QR detected:", scannedText);

                // Use enhanced validation and multi-attempt scanning
                const validation = validateQRCode(scannedText);
                if (validation.isValid) {
                  // Call handleScanResult via ref to avoid circular dependency
                  setTimeout(() => {
                    if (handleScanResultRef.current) {
                      handleScanResultRef.current(scannedText);
                    }
                  }, 0);
                } else {
                  // Try multi-attempt scan for better accuracy
                  setTimeout(() => {
                    const currentAttempts = scanAttempts;
                    if (currentAttempts < 3) {
                      setScanAttempts(currentAttempts + 1);
                      console.log(
                        `Scan validation failed, attempt ${currentAttempts + 1}`
                      );
                    } else {
                      setError(
                        "QR code tidak dapat dikenali. Silakan coba input manual."
                      );
                      setShowManualInput(true);
                    }
                  }, 500);
                }
              }
              if (error && !(error instanceof NotFoundException)) {
                console.warn("ZXing scan error:", error);
                // Don't show error for common "not found" errors
              }
            }
          );
        }

        setIsScanning(true);
        setError(null);

        // Monitor lighting conditions
        setTimeout(() => {
          if (videoRef.current) {
            const lightLevel = detectLighting(videoRef.current);
            if (lightLevel < 30) {
              toast.info(
                "Cahaya kurang terang. Pindah ke tempat yang lebih terang atau gunakan zoom untuk fokus yang lebih baik."
              );
            }
          }
        }, 2000);
      } catch (err: unknown) {
        console.error("Start scanning error:", err);
        setError("Failed to start scanning. Please try again.");
        setIsScanning(false);
        setRetryCount((prev) => prev + 1);
      }
    },
    [
      enhanceVideoStream,
      validateQRCode,
      scanAttempts,
      detectLighting,
      checkBrowserSupport,
      scanWithBarcodeDetector,
      useFallback,
      setUseFallback,
      stopScanning,
    ]
  );
  const switchCamera = useCallback(() => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (device) => device.deviceId === selectedDeviceId
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      const nextDevice = devices[nextIndex];

      stopScanning();
      setSelectedDeviceId(nextDevice.deviceId);

      // Also toggle facing mode for better camera selection
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));

      setTimeout(() => {
        startScanning(nextDevice.deviceId);
      }, 500);

      toast.info(
        `Switching to camera: ${
          nextDevice.label || "Camera " + (nextIndex + 1)
        }`
      );
    } else {
      toast.info("Only one camera available");
    }
  }, [devices, selectedDeviceId, startScanning, stopScanning]);

  const handleScanResult = useCallback(
    async (scannedText: string) => {
      try {
        const validation = validateQRCode(scannedText);

        if (!validation.isValid) {
          toast.error(
            "Invalid QR Code. Make sure this is a valid UNDIP attendance QR code."
          );
          return;
        }

        let extractedCode = "";

        // Enhanced extraction logic
        if (validation.data.code) {
          extractedCode = validation.data.code;
        } else if (/^[a-f0-9]{12}$/i.test(scannedText)) {
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
          // Stop scanning immediately to prevent multiple scans
          stopScanning();

          toast.success("QR Code scanned successfully!");
          await saveAttendanceHistory(extractedCode);
          onScanSuccess?.(extractedCode);

          // Open UNDIP attendance page
          const absenUrl = `https://siap.undip.ac.id/a/${extractedCode}`;
          setLastScannedUrl(absenUrl);

          // Try to open in new window
          const newWindow = window.open(
            absenUrl,
            "_blank",
            "noopener,noreferrer"
          );

          // Fallback if popup blocked
          if (!newWindow || newWindow.closed) {
            toast.info(
              "Popup diblokir! Klik tombol 'Buka Halaman Absen' di bawah untuk melanjutkan."
            );
          } else {
            toast.success("Halaman absen telah dibuka di tab baru!");
            // Auto close modal after successful scan
            setTimeout(() => {
              onClose();
            }, 2000);
          }
        } else {
          toast.error(
            "Format QR code tidak dikenali. Pastikan ini adalah QR code absen UNDIP yang valid."
          );
          setShowManualInput(true);
        }
      } catch (error) {
        console.error("Handle scan result error:", error);
        toast.error("Terjadi kesalahan saat memproses QR code.");
      }
    },
    [
      validateQRCode,
      onScanSuccess,
      onClose,
      saveAttendanceHistory,
      stopScanning,
    ]
  );

  // Use ref to avoid circular dependencies with handleScanResult
  const handleScanResultRef =
    useRef<(scannedText: string) => Promise<void> | null>(null);

  // Assign the current handleScanResult to the ref
  handleScanResultRef.current = handleScanResult;

  // Manual QR code input handler
  const handleManualSubmit = useCallback(() => {
    if (manualCode.trim()) {
      const validation = validateQRCode(manualCode.trim());
      if (validation.isValid && validation.data.code) {
        // Use ref to avoid dependency issue
        if (handleScanResultRef.current) {
          handleScanResultRef.current(validation.data.code);
        }
        setManualCode("");
        setShowManualInput(false);
      } else {
        toast.error(
          "Format kode tidak valid. Masukkan kode 12 karakter huruf dan angka."
        );
      }
    }
  }, [manualCode, validateQRCode]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast.info("Memproses gambar...");

    const reader = new FileReader();
    reader.onload = async () => {
      const image = new Image();
      image.src = reader.result as string;
      image.onload = async () => {
        try {
          // Enhanced image preprocessing for better QR detection
          const processedCanvases = await preprocessImageForQR(image);

          let qrDetected = false;

          // Try BarcodeDetector first if available
          if ("BarcodeDetector" in window && !useFallback) {
            try {
              const detector = new BarcodeDetector({ formats: ["qr_code"] });

              for (const canvas of processedCanvases) {
                try {
                  const barcodes = await detector.detect(canvas);
                  for (const barcode of barcodes) {
                    if (barcode.format === "qr_code" && barcode.rawValue) {
                      console.log(
                        "BarcodeDetector detected from image:",
                        barcode.rawValue
                      );
                      if (handleScanResultRef.current) {
                        handleScanResultRef.current(barcode.rawValue);
                      }
                      qrDetected = true;
                      break;
                    }
                  }
                  if (qrDetected) break;
                } catch (e) {
                  console.warn("BarcodeDetector failed for canvas:", e);
                }
              }
            } catch (e) {
              console.warn("BarcodeDetector not available for image:", e);
            }
          }

          // Fallback to ZXing if BarcodeDetector failed
          if (!qrDetected) {
            console.log("Trying ZXing for image processing...");
            const codeReader = new BrowserMultiFormatReader();

            // Try multiple processed versions
            for (const canvas of processedCanvases) {
              try {
                // Convert canvas to image for ZXing
                const canvasDataUrl = canvas.toDataURL();
                const canvasImage = new Image();
                canvasImage.src = canvasDataUrl;

                await new Promise((resolve) => {
                  canvasImage.onload = resolve;
                });

                const result = await codeReader.decodeFromImage(canvasImage);
                const scannedText = result.getText();
                console.log("ZXing detected from image:", scannedText);
                if (handleScanResultRef.current) {
                  handleScanResultRef.current(scannedText);
                }
                qrDetected = true;
                break;
              } catch (e) {
                console.warn("ZXing failed for canvas:", e);
              }
            }
          }

          if (!qrDetected) {
            toast.error(
              "QR code tidak ditemukan dalam gambar. Pastikan QR code terlihat jelas dan coba foto yang lebih baik."
            );
          }
        } catch (error) {
          console.error("Gagal memindai gambar:", error);
          toast.error("Terjadi kesalahan saat memproses gambar.");
        }
      };
    };
    reader.readAsDataURL(file);
  };

  // Enhanced image preprocessing function
  const preprocessImageForQR = async (
    image: HTMLImageElement
  ): Promise<HTMLCanvasElement[]> => {
    const canvases: HTMLCanvasElement[] = [];

    // Original image
    const originalCanvas = document.createElement("canvas");
    const originalCtx = originalCanvas.getContext("2d")!;
    originalCanvas.width = image.width;
    originalCanvas.height = image.height;
    originalCtx.drawImage(image, 0, 0);
    canvases.push(originalCanvas);

    // Enhanced contrast version
    const contrastCanvas = document.createElement("canvas");
    const contrastCtx = contrastCanvas.getContext("2d")!;
    contrastCanvas.width = image.width;
    contrastCanvas.height = image.height;
    contrastCtx.drawImage(image, 0, 0);

    // Apply contrast enhancement
    const imageData = contrastCtx.getImageData(
      0,
      0,
      contrastCanvas.width,
      contrastCanvas.height
    );
    const data = imageData.data;

    // Increase contrast and convert to grayscale
    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

      // Apply contrast enhancement
      const contrast = 2.5; // Increase contrast more for projector images
      const enhanced = ((gray / 255 - 0.5) * contrast + 0.5) * 255;

      // Apply threshold to pure black/white
      const threshold = enhanced > 120 ? 255 : 0; // Lower threshold for dark QR codes

      data[i] = threshold; // Red
      data[i + 1] = threshold; // Green
      data[i + 2] = threshold; // Blue
      // Alpha stays the same
    }

    contrastCtx.putImageData(imageData, 0, 0);
    canvases.push(contrastCanvas);

    // Scaled up version for better detection
    if (image.width < 800 || image.height < 800) {
      const scaledCanvas = document.createElement("canvas");
      const scaledCtx = scaledCanvas.getContext("2d")!;
      const scale = Math.max(800 / image.width, 800 / image.height);
      scaledCanvas.width = image.width * scale;
      scaledCanvas.height = image.height * scale;

      // Use image smoothing for better quality
      scaledCtx.imageSmoothingEnabled = false;
      scaledCtx.drawImage(image, 0, 0, scaledCanvas.width, scaledCanvas.height);
      canvases.push(scaledCanvas);

      // Also create a high contrast scaled version
      const scaledContrastCanvas = document.createElement("canvas");
      const scaledContrastCtx = scaledContrastCanvas.getContext("2d")!;
      scaledContrastCanvas.width = image.width * scale;
      scaledContrastCanvas.height = image.height * scale;
      scaledContrastCtx.imageSmoothingEnabled = false;
      scaledContrastCtx.drawImage(
        contrastCanvas,
        0,
        0,
        scaledContrastCanvas.width,
        scaledContrastCanvas.height
      );
      canvases.push(scaledContrastCanvas);
    }

    // Rotated versions (untuk handle foto yang dirotasi)
    const rotations = [90, 180, 270];
    for (const rotation of rotations) {
      const rotatedCanvas = document.createElement("canvas");
      const rotatedCtx = rotatedCanvas.getContext("2d")!;

      if (rotation === 90 || rotation === 270) {
        rotatedCanvas.width = image.height;
        rotatedCanvas.height = image.width;
      } else {
        rotatedCanvas.width = image.width;
        rotatedCanvas.height = image.height;
      }

      rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
      rotatedCtx.rotate((rotation * Math.PI) / 180);
      rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

      canvases.push(rotatedCanvas);
    }

    return canvases;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-100 p-4">
      <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/30">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Scan Attendance QR Code
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Point camera or select QR image
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-1 rounded-xl text-gray-200 bg-background/30 hover:bg-background/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              <Button onClick={initScanner} className="mt-2 text-sm" size="sm">
                Try Again
              </Button>
            </div>
          )}
          {hasPermission === false && (
            <div className="text-center py-8">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Camera Permission Required
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Grant camera access to scan QR codes
              </p>
              <Button onClick={initScanner}>
                <Camera className="w-4 h-4 mr-2" />
                Enable Camera
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
                  <div
                    className={`w-48 h-48 border-2 border-white/60 rounded-lg ${
                      isScanning ? "animate-pulse" : ""
                    }`}
                  >
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

                {/* Enhanced Controls Overlay */}
                {isScanning && (
                  <div className="absolute top-4 right-4 z-10">
                    {/* Vertical Zoom Control */}
                    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <Slider
                        value={[zoomLevel]}
                        onValueChange={handleZoomChange}
                        min={1}
                        max={3}
                        step={0.1}
                        orientation="vertical"
                        className="h-24 w-4 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* Brightness Indicator */}
                {brightness < 30 && isScanning && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-orange-500/80 text-white text-xs px-2 py-1 rounded">
                      ⚠️ Low light - Move to a brighter location
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {isScanning
                      ? scanAttempts > 0
                        ? `Retrying scan... (${scanAttempts}/3)`
                        : `Scanning QR code... ${
                            !useFallback &&
                            checkBrowserSupport().features.barcodeDetector
                              ? "⚡ Fast Mode"
                              : "🔄 ZXing Mode"
                          }`
                      : "Preparing camera..."}
                  </p>
                  {brightness > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            brightness < 30
                              ? "bg-red-500"
                              : brightness < 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (brightness / 100) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {brightness < 30
                          ? "Dark"
                          : brightness < 60
                          ? "Fair"
                          : "Bright"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {devices.length > 1 && (
                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      size="sm"
                      disabled={!isScanning}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Switch
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => galleryInputRef.current?.click()}
                    title="Upload QR code image from gallery"
                  >
                    <ImagePlus className="w-4 h-4 mr-1" />
                    Gallery
                  </Button>

                  {/* Input untuk galeri (tanpa capture) */}
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />

                  {/* Input untuk kamera (dengan capture) */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Manual Input Section */}
              {showManualInput && (
                <div className="mb-4 p-4 border border-border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-medium text-card-foreground">
                      Manual Input
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    If scanner doesn't work, enter QR code (12 characters)
                    manually:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Example: a1b2c3d4e5f6"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1"
                      maxLength={12}
                    />
                    <Button
                      onClick={handleManualSubmit}
                      disabled={!manualCode.trim() || manualCode.length !== 12}
                      size="sm"
                    >
                      Submit
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Code must be 12 characters of letters and numbers
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="w-full"
                >
                  <Type className="w-4 h-4 mr-1" />
                  {showManualInput ? "Hide Manual Input" : "Manual Input"}
                </Button>
              </div>
            </div>
          )}{" "}
          {/* Manual button to open attendance page if popup is blocked */}
          {lastScannedUrl && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                QR Code scanned successfully! If the attendance page doesn't
                open automatically, click the button below:
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
                  🌐 Open Attendance Page
                </Button>
                <Button
                  onClick={() => {
                    setLastScannedUrl(null);
                  }}
                  variant="outline"
                  size="sm"
                >
                  ✕ Close
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
