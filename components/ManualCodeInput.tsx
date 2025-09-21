"use client";

import { useCallback, useEffect, useState } from "react";
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

  return (
    <div className="pointer-events-auto w-screen">
      <div
        className="
          w-screen
          rounded-t-3xl
          bg-card/95 backdrop-blur-md
          shadow-[0_-10px_30px_rgba(0,0,0,0.25)]
          border-t border-border/60
          px-5 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]
        "
      >
        {/* handle */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/40" />

        {/* header ringkas */}
        <div className="mb-3 flex items-center gap-2 px-1">
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
        <div className="rounded-xl border bg-background/60 p-2 mx-1">
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

        <div className="text-xs text-muted-foreground mt-2">
          Code must be 12 characters of letters and numbers
        </div>

        {lastUrl && (
          <div className="mt-3 rounded-xl border bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20 mx-1">
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
