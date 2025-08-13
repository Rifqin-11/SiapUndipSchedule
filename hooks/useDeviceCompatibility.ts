"use client";

import { useState, useEffect } from "react";

interface DeviceInfo {
  isIOS: boolean;
  isSafari: boolean;
  isClient: boolean;
  supportsCamera: boolean;
  supportsNotifications: boolean;
}

export const useDeviceCompatibility = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isIOS: false,
    isSafari: false,
    isClient: false,
    supportsCamera: false,
    supportsNotifications: false,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

    const supportsCamera = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    const supportsNotifications = !!(
      "Notification" in window &&
      typeof Notification.requestPermission === "function"
    );

    setDeviceInfo({
      isIOS,
      isSafari,
      isClient: true,
      supportsCamera,
      supportsNotifications,
    });

    // Log device info for debugging
    console.log("Device compatibility:", {
      isIOS,
      isSafari,
      supportsCamera,
      supportsNotifications,
      userAgent,
    });
  }, []);

  return deviceInfo;
};

export default useDeviceCompatibility;
