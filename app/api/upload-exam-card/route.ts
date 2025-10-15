// File: app/api/upload-exam-card/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyJWTToken } from "@/lib/auth";

// Azure Computer Vision setup
const azureEndpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT;
const azureKey = process.env.AZURE_COMPUTER_VISION_KEY;

if (!azureEndpoint || !azureKey) {
  console.error(
    "Azure Computer Vision credentials not found in environment variables"
  );
}

// Gemini AI setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment variables");
}
const genAI = new GoogleGenerativeAI(apiKey!);

interface OcrLine {
  text: string;
}

interface ParsedExamSchedule {
  id: string;
  name: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  examType: "UTS" | "UAS";
}

interface RawExam {
  id?: string;
  name?: string;
  examDate?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  examType?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(
    `=== UPLOAD-EXAM-CARD API STARTED AT ${new Date().toISOString()} ===`
  );

  try {
    // Check authentication first
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyJWTToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // 1. Parse form data dari request
    console.log("Step 1: Parsing form data...");
    console.log("Request URL:", req.url);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    const formData = await req.formData();
    console.log(
      "FormData entries:",
      Array.from(formData.entries()).map(([key, value]) => [
        key,
        value && typeof value === "object" && "name" in value && "size" in value
          ? `File: ${value.name} (${value.size} bytes, ${value.type})`
          : value,
      ])
    );

    const file = formData.get("file") as File;
    const examType = formData.get("examType") as string;
    const periodStartDate = formData.get("periodStartDate") as string;
    const periodEndDate = formData.get("periodEndDate") as string;

    if (!file) {
      console.log("ERROR: File tidak ditemukan");
      console.log("Available form data keys:", Array.from(formData.keys()));
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    if (!periodStartDate || !periodEndDate) {
      return NextResponse.json(
        { error: "Exam period dates are required" },
        { status: 400 }
      );
    }

    // Additional validation to ensure file is valid
    if (typeof file === "string" || !file || !file.name || file.size === 0) {
      console.log("ERROR: File is not a valid File object");
      console.log("File type:", typeof file);
      console.log("File object:", file);
      return NextResponse.json(
        { error: "File is not defined" },
        { status: 400 }
      );
    }

    console.log(
      `File diterima: ${file.name}, Size: ${file.size}, Type: ${file.type}`
    );
    console.log(`Exam Type: ${examType}`);
    console.log(`Period: ${periodStartDate} to ${periodEndDate}`);

    // Validasi tipe file - expand supported formats
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/bmp",
      "image/tiff",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      console.log(`ERROR: File type tidak didukung: ${file.type}`);
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Gunakan PNG, JPG, JPEG, WEBP, BMP, TIFF, atau PDF.",
        },
        { status: 400 }
      );
    }

    // Check file size (max 15MB)
    const maxSize = 15 * 1024 * 1024; // 15MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "File terlalu besar. Maksimal 15MB untuk performa OCR yang optimal.",
        },
        { status: 400 }
      );
    }

    // 2. Proses OCR dengan Azure Computer Vision
    console.log("Step 2: Memulai proses OCR dengan Azure Computer Vision...");
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Buffer created, size: ${buffer.length} bytes`);

    let rawText = "";

    try {
      console.log("Mengirim gambar ke Azure Computer Vision...");

      // Step 1: Submit image to Azure Computer Vision Read API
      const readUrl = `${azureEndpoint}/vision/v3.2/read/analyze`;

      const submitResponse = await axios.post(readUrl, buffer, {
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey!,
          "Content-Type": "application/octet-stream",
        },
      });

      // Get operation URL from response headers
      const operationUrl = submitResponse.headers["operation-location"];
      if (!operationUrl) {
        throw new Error(
          "Failed to get operation URL from Azure Computer Vision"
        );
      }

      console.log("Azure OCR operation submitted, URL:", operationUrl);

      // Step 2: Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 30; // Maximum 30 attempts (30 seconds)

      do {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

        const pollResponse = await axios.get(operationUrl, {
          headers: {
            "Ocp-Apim-Subscription-Key": azureKey!,
          },
        });

        result = pollResponse.data;
        attempts++;
        console.log(
          `Azure OCR polling attempt ${attempts}, status: ${result.status}`
        );

        if (attempts >= maxAttempts) {
          throw new Error("Azure OCR timeout - proses terlalu lama");
        }
      } while (result.status === "running" || result.status === "notStarted");

      if (result.status === "failed") {
        throw new Error("Azure OCR failed to process the image");
      }

      // Extract text from results
      if (result.analyzeResult?.readResults) {
        for (const page of result.analyzeResult.readResults) {
          for (const line of page.lines || []) {
            rawText += line.text + "\n";
          }
        }
      }

      console.log("Azure OCR selesai!");
      console.log(
        "Teks yang diekstrak (200 karakter pertama):",
        rawText.substring(0, 200)
      );
      console.log("Total karakter diekstrak:", rawText.length);
      console.log("Raw result structure:", JSON.stringify(result, null, 2));

      // More lenient validation - just check if we got any meaningful text
      if (!rawText || rawText.trim().length < 5) {
        console.log("ERROR: Azure OCR tidak menghasilkan teks yang cukup");
        console.log("Full result object:", result);

        // Try alternative text extraction methods
        if (result.analyzeResult?.readResults) {
          console.log("Alternative extraction attempt...");
          let alternativeText = "";
          for (const page of result.analyzeResult.readResults) {
            if (page.lines) {
              alternativeText +=
                page.lines.map((line: OcrLine) => line.text).join(" ") + " ";
            }
          }
          if (alternativeText.trim().length > 0) {
            rawText = alternativeText;
            console.log(
              "Alternative extraction successful:",
              rawText.substring(0, 100)
            );
          }
        }

        // If still no text, return more helpful error
        if (!rawText || rawText.trim().length < 5) {
          return NextResponse.json(
            {
              error:
                "Failed to read text from image. Make sure the image is clear and readable. Try using a higher quality image or different format (PNG/JPG).",
              details: "OCR extracted text length: " + rawText.length,
            },
            { status: 400 }
          );
        }
      }
    } catch (azureError) {
      console.error("Azure OCR Error:", azureError);

      // More detailed error messages based on error type
      let errorMessage = "Azure OCR gagal memproses gambar.";

      if (azureError instanceof Error) {
        if (azureError.message.includes("timeout")) {
          errorMessage =
            "OCR timeout - coba dengan gambar yang lebih kecil atau format yang berbeda.";
        } else if (azureError.message.includes("format")) {
          errorMessage =
            "Format gambar tidak didukung oleh OCR. Gunakan PNG atau JPG berkualitas tinggi.";
        } else if (
          azureError.message.includes("quota") ||
          azureError.message.includes("limit")
        ) {
          errorMessage =
            "OCR service quota exceeded. Coba lagi dalam beberapa menit.";
        } else {
          errorMessage = `OCR Error: ${azureError.message}`;
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          suggestion:
            "Tips: Pastikan gambar berkualitas tinggi, teks jelas terbaca, dan format PNG/JPG.",
        },
        { status: 500 }
      );
    }

    // 3. Analisis dengan Gemini AI
    console.log("Step 3: Memulai analisis dengan Gemini AI...");
    const prompt = `
Anda adalah asisten AI yang ahli dalam menganalisis kartu jadwal ujian (Kartu UTS/UAS) mahasiswa.

Dari teks hasil OCR berikut, ekstrak informasi jadwal ujian dan kembalikan dalam format JSON array.

Teks Kartu Ujian:
${rawText}

Informasi Periode Ujian: ${periodStartDate} sampai ${periodEndDate}
Tipe Ujian: ${examType}

INSTRUKSI PENTING:
1. Cari semua mata kuliah yang ada jadwal ujiannya dalam kartu
2. Ekstrak informasi: nama mata kuliah, tanggal ujian, jam mulai, jam selesai, dan ruangan
3. Gunakan format 24 jam untuk waktu (contoh: "08:00", "14:30")
4. Untuk tanggal ujian (examDate), gunakan format YYYY-MM-DD
5. Jika tahun tidak disebutkan, gunakan tahun dari periode yang diberikan
6. Jika bulan tidak disebutkan lengkap, coba inferensi dari konteks periode ujian
7. Generate unique ID untuk setiap ujian
8. examType selalu "${examType}"

Kembalikan HANYA JSON array dengan format berikut:
[
  {
    "id": "generated_unique_id",
    "name": "nama_mata_kuliah",
    "examDate": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "room": "ruangan",
    "examType": "${examType}"
  }
]

Contoh output:
[
  {
    "id": "exam_${examType}_001",
    "name": "Algoritma dan Pemrograman",
    "examDate": "2024-11-05",
    "startTime": "08:00",
    "endTime": "10:00",
    "room": "K201",
    "examType": "${examType}"
  }
]

Pastikan JSON valid dan tidak ada teks tambahan di luar JSON array.
    `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    console.log("Mengirim request ke Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    console.log("Response dari Gemini AI diterima!");
    console.log(
      "AI Response (200 karakter pertama):",
      aiText.substring(0, 200)
    );

    // 4. Parse response JSON
    let exams: ParsedExamSchedule[];
    try {
      console.log("Step 4: Parsing JSON response...");
      // Clean the response to extract only JSON
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log("ERROR: Tidak ditemukan JSON array dalam response AI");
        console.log("Full AI Response:", aiText);
        throw new Error("AI tidak mengembalikan format JSON yang valid");
      }

      console.log("JSON match found:", jsonMatch[0].substring(0, 100) + "...");
      const parsedData = JSON.parse(jsonMatch[0]);

      // Generate unique IDs if not provided and ensure all fields
      exams = parsedData.map(
        (exam: RawExam, index: number): ParsedExamSchedule => ({
          id: exam.id || `exam_${examType}_${Date.now()}_${index}`,
          name: exam.name || "Subject",
          examDate: exam.examDate || periodStartDate,
          startTime: exam.startTime || "08:00",
          endTime: exam.endTime || "10:00",
          room: exam.room || "TBA",
          examType: (exam.examType || examType) as "UTS" | "UAS",
        })
      );

      console.log(`Successfully parsed ${exams.length} exam schedules`);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Full AI Response that failed to parse:", aiText);
      return NextResponse.json(
        {
          error:
            "AI response tidak dapat di-parse. Coba lagi dengan gambar yang lebih jelas.",
        },
        { status: 500 }
      );
    }

    // 5. Validasi hasil
    if (!Array.isArray(exams) || exams.length === 0) {
      console.log("ERROR: Tidak ada jadwal ujian yang ditemukan");
      return NextResponse.json(
        {
          error:
            "Tidak dapat menemukan jadwal ujian dalam gambar. Pastikan gambar kartu ujian jelas dan terbaca.",
        },
        { status: 400 }
      );
    }

    console.log(
      `=== SUCCESS: ${exams.length} jadwal ujian berhasil diekstrak ===`
    );
    console.log(`Total processing time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      exams: exams,
      message: `Berhasil mengekstrak ${exams.length} jadwal ujian dari kartu ${examType}`,
      extractedText: rawText.substring(0, 500), // For debugging
    });
  } catch (error: unknown) {
    console.error("=== UPLOAD-EXAM-CARD ERROR ===");
    console.error("Error details:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memproses file";
    console.error("Error message:", errorMessage);

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
