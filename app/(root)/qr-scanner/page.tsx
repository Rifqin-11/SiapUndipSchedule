import QRScannerClient from "@/components/QRScannerPage";
import ManualCardClient from "@/components/ManualCodeInput";
import SimplePageHeader from "@/components/SimplePageHeader";

export const dynamic = "force-dynamic"; // opsional jika perlu runtime

export default async function QRScannerPage() {
  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background">
      {/* Kamera (layer dasar, full-bleed) */}
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
