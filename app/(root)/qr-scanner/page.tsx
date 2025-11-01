import QRScannerClient from "@/components/QRScannerPage";
import ManualCardClient from "@/components/ManualCodeInput";
import BodyScrollLock from "@/app/(root)/qr-scanner/Body-scroll-lock";

export const dynamic = "force-dynamic"; // opsional

export default async function QRScannerPage() {
  return (
    // Wrapper full-viewport & no-scroll
    <div className="fixed inset-0 h-[100dvh] w-screen overflow-hidden overscroll-none bg-background">
      {/* Kunci scroll (via effect ke <html> & <body>) */}
      <BodyScrollLock />

      {/* Kamera (layer dasar) */}
      <section className="absolute inset-0">
        <QRScannerClient />
      </section>

      {/* Bottom sheet di atas kamera */}
      <section className="absolute inset-x-0 bottom-0">
        <ManualCardClient />
      </section>
    </div>
  );
}
