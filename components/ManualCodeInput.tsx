"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Send, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";

const parseCode = (raw: string) =>
  (/^[a-f0-9]{12}$/i.test(raw) && raw.toLowerCase()) ||
  raw.match(/siap\.undip\.ac\.id\/a\/([a-f0-9]{12})/i)?.[1]?.toLowerCase() ||
  raw.match(/([a-f0-9]{12})/i)?.[1]?.toLowerCase();

export default function ManualCardClient() {
  const [manualCode, setManualCode] = useState("");
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  // Drawer state and swipe handling
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const currentYRef = useRef(0);

  useEffect(() => {
    const onScanned = (e: Event) => {
      const raw = (e as CustomEvent).detail as string;
      const code = parseCode(raw);
      if (!code) return;
      const url = `https://siap.undip.ac.id/a/${code}`;
      setLastUrl(url);
      try {
        window.open(url, "_blank", "noopener,noreferrer");
      } catch {}
    };
    window.addEventListener("qr:scanned", onScanned as any);
    return () => window.removeEventListener("qr:scanned", onScanned as any);
  }, []);

  const submitManual = useCallback(() => {
    const code = parseCode(manualCode.trim());
    if (!code) return toast.error("Kode harus 12 karakter (hex)");
    const url = `https://siap.undip.ac.id/a/${code}`;
    setLastUrl(url);
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {}
  }, [manualCode]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submitManual();
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return toast.error("Clipboard kosong");
      setManualCode(text.trim());
    } catch {
      toast.error("Tidak bisa akses clipboard");
    }
  };

  // Touch event handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return;

      currentYRef.current = e.touches[0].clientY;
      const deltaY = currentYRef.current - startYRef.current;

      // Only allow dragging down when expanded, or up when collapsed
      if (isExpanded && deltaY > 0) {
        setDragY(deltaY);
      } else if (!isExpanded && deltaY < 0) {
        setDragY(deltaY);
      }
    },
    [isDragging, isExpanded]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50; // pixels to trigger collapse/expand

    if (isExpanded && dragY > threshold) {
      // Swipe down - collapse
      setIsExpanded(false);
    } else if (!isExpanded && dragY < -threshold) {
      // Swipe up - expand
      setIsExpanded(true);
    }

    // Reset drag position
    setDragY(0);
  }, [isDragging, dragY, isExpanded]);

  // Handle clicking on handle to toggle
  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <div className="pointer-events-auto w-screen">
      <div
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="
          w-screen
          rounded-t-3xl
          bg-card/95 backdrop-blur-md
          shadow-[0_-10px_30px_rgba(0,0,0,0.25)]
          border-t border-border/60
          px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]
        "
        style={{
          transform: isDragging
            ? `translateY(${dragY}px)`
            : isExpanded
            ? "translateY(0)"
            : "translateY(calc(100% - 3rem))",
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
      >
        {/* handle - clickable to toggle */}
        <div
          onClick={handleToggle}
          className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/40 cursor-pointer hover:bg-muted-foreground/60 transition-all active:scale-95"
          aria-label={
            isExpanded ? "Swipe down to collapse" : "Swipe up to expand"
          }
        />

        {/* Collapsed state hint */}
        {!isExpanded && (
          <div className="text-center text-xs text-muted-foreground pb-2 animate-pulse">
            Swipe up or tap handle to enter code manually
          </div>
        )}

        {/* header ringkas */}
        <div
          className="mb-3 flex items-center gap-2 px-1 transition-opacity duration-300"
          style={{ opacity: isExpanded ? 1 : 0 }}
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold">Scan Attendance QR</div>
            <div className="ml-auto text-xs text-muted-foreground">
              If scanner doesn't work, enter QR code (12 characters) manually:
            </div>
          </div>
        </div>

        {/* input + paste + send */}
        <div
          className="rounded-xl border bg-background/60 p-2 mx-1 transition-opacity duration-300"
          style={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              placeholder="Example: a1b2c3d4e5f6"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={onKey}
              maxLength={12}
              className="h-11 text-base"
            />
            <Button
              type="button"
              size="icon"
              onClick={pasteFromClipboard}
              className="h-11 w-11"
              title="Paste dari clipboard"
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              onClick={submitManual}
              disabled={manualCode.trim().length !== 12}
              className="h-11 w-11"
              title="Kirim kode"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          className="text-xs text-muted-foreground mt-2 transition-opacity duration-300"
          style={{ opacity: isExpanded ? 1 : 0 }}
        >
          Code must be 12 characters of letters and numbers
        </div>

        {lastUrl && (
          <div
            className="mt-3 rounded-xl border bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20 mx-1 transition-opacity duration-300"
            style={{
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
            }}
          >
            Berhasil! Jika tab tidak terbuka:
            <Button
              size="sm"
              className="mt-2 w-full"
              onClick={() => window.open(lastUrl!, "_blank")}
            >
              Buka Halaman Absen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
