import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size too large" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Save the file temporarily
    // 2. Parse the file based on its type (Excel, CSV, PDF)
    // 3. Extract schedule data using appropriate libraries
    // 4. Return the parsed data

    // For now, return mock parsed data
    const mockParsedData = [
      {
        id: "ALG001",
        name: "Algoritma dan Pemrograman",
        day: "Monday",
        startTime: "08:00",
        endTime: "10:00",
        room: "Lab Komputer 1",
        lecturer: ["Dr. Ahmad Santoso, M.Kom"],
        meeting: 1,
        category: "High",
      },
      {
        id: "DB001",
        name: "Basis Data",
        day: "Tuesday",
        startTime: "10:00",
        endTime: "12:00",
        room: "Ruang 204",
        lecturer: ["Prof. Siti Nurhaliza, Ph.D"],
        meeting: 1,
        category: "Medium",
      },
      {
        id: "RPL001",
        name: "Rekayasa Perangkat Lunak",
        day: "Wednesday",
        startTime: "13:00",
        endTime: "15:00",
        room: "Ruang 301",
        lecturer: ["Dr. Budi Raharjo, M.T", "Drs. Agus Wijaya"],
        meeting: 1,
        category: "High",
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockParsedData,
      message: "File parsed successfully",
    });
  } catch (error) {
    console.error("Upload KRS error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
