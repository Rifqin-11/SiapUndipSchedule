import { NextResponse } from "next/server";

export async function GET() {
  try {
    // In a real implementation, you would:
    // 1. Generate an Excel template with proper headers
    // 2. Return the file as a blob

    // For now, we'll create a simple CSV template
    const csvTemplate = `Nama Mata Kuliah,Hari,Jam Mulai,Jam Selesai,Ruangan,Dosen,Kategori
Algoritma dan Pemrograman,Monday,08:00,10:00,Lab Komputer 1,Dr. Ahmad Santoso M.Kom,High
Basis Data,Tuesday,10:00,12:00,Ruang 204,Prof. Siti Nurhaliza Ph.D,Medium
Rekayasa Perangkat Lunak,Wednesday,13:00,15:00,Ruang 301,Dr. Budi Raharjo M.T,High`;

    const response = new NextResponse(csvTemplate);
    response.headers.set("Content-Type", "text/csv");
    response.headers.set(
      "Content-Disposition",
      'attachment; filename="template-krs.csv"'
    );

    return response;
  } catch (error) {
    console.error("Download template error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
