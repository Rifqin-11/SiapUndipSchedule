"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Send } from "lucide-react";
import { toast } from "sonner";

const parseCode = (raw: string) =>
  (/^[a-f0-9]{12}$/i.test(raw) && raw.toLowerCase()) ||
  raw.match(/siap\.undip\.ac\.id\/a\/([a-f0-9]{12})/i)?.[1]?.toLowerCase() ||
  raw.match(/([a-f0-9]{12})/i)?.[1]?.toLowerCase();

export default function ManualCardClient() {
  const [manualCode, setManualCode] = useState("");
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  // terima hasil dari scanner (event dari QRScannerClient)
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

  return (
    <div className="pointer-events-auto w-full pb-[env(safe-area-inset-bottom)]">
      <div
        className="
          mx-auto w-full max-w-xl
          rounded-t-3xl
          bg-card/95 backdrop-blur-md
          shadow-[0_-10px_30px_rgba(0,0,0,0.25)]
          border border-border/60
          px-4 pt-3 pb-4
        "
      >
        {/* handle kecil */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted-foreground/40" />

        {/* header sangat ringkas */}
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm font-semibold">Scan Attendance QR</div>
        </div>

        {/* input manual (selalu tampil, minimalis) */}
        <div className="rounded-xl border bg-background/50 p-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Masukkan kode (12 karakter)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={onKey}
              maxLength={12}
              className="h-10"
            />
            <Button
              type="button"
              size="icon"
              onClick={submitManual}
              disabled={manualCode.trim().length !== 12}
              className="h-10 w-10"
              title="Kirim kode"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* CTA jika perlu buka ulang */}
        {lastUrl && (
          <div className="mt-3 rounded-xl border bg-emerald-50 p-3 text-sm dark:bg-emerald-900/20">
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
