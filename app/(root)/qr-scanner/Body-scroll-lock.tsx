"use client";

import { useEffect } from "react";

/**
 * Kunci scroll global (html, body) saat komponen ini ter-mount.
 * Aman untuk iOS Safari (mencegah bounce).
 */
export default function BodyScrollLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevTouch = html.style.touchAction;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.touchAction = "none";

    // iOS: cegah rubber-band/bounce
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      html.style.touchAction = prevTouch;
      document.removeEventListener("touchmove", prevent as any);
    };
  }, []);

  return null;
}
