// File: app/api/upload-krs/route.ts
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

interface ParsedSubject {
  id: string;
  name: string;
  day: string; // Can be empty string
  startTime: string; // Can be empty string
  endTime: string; // Can be empty string
  room: string; // Can be empty string
  lecturer: string[];
  meeting: number;
  category: string;
}

interface RawSubject {
  id?: string;
  name?: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  lecturer?: string | string[];
  meeting?: number;
  category?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log(`=== UPLOAD-KRS API STARTED AT ${new Date().toISOString()} ===`);

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

    if (!file) {
      console.log("ERROR: File tidak ditemukan");
      console.log("Available form data keys:", Array.from(formData.keys()));
      return NextResponse.json(
        { error: "File tidak ditemukan" },
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

    // Validasi tipe file - expand supported formats
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
    if (!allowedTypes.includes(file.type)) {
      console.log(`ERROR: File type tidak didukung: ${file.type}`);
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Gunakan PNG, JPG, JPEG, WEBP, BMP, atau TIFF.",
        },
        { status: 400 }
      );
    }

    // Check file size (max 10MB for better OCR performance)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "File terlalu besar. Maksimal 10MB untuk performa OCR yang optimal.",
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
Anda adalah asisten AI yang ahli dalam menganalisis dokumen IRS (Isian Rencana Studi) mahasiswa.

Dari teks hasil OCR berikut, ekstrak informasi jadwal kuliah dan kembalikan dalam format JSON array.

Teks IRS:
${rawText}

INSTRUKSI PENTING:
1. Cari semua mata kuliah yang terdaftar dalam IRS
2. Ekstrak informasi: nama mata kuliah, hari, jam mulai, jam selesai, ruangan, dan dosen
3. Gunakan format 24 jam untuk waktu (contoh: "08:00", "14:30")
4. Untuk hari, gunakan format: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
5. PENTING: Jika pada IRS tidak terdapat informasi hari (day), jam mulai (startTime), jam selesai (endTime), atau ruangan (room), maka berikan nilai kosong ("") - JANGAN berikan nilai default
6. Hanya berikan nilai jika informasi tersebut jelas tertulis dalam IRS
7. Untuk mata kuliah tanpa jadwal (seperti skripsi, KKN, dll), kosongkan field day, startTime, endTime, dan room

Kembalikan HANYA JSON array dengan format berikut:
[
  {
    "id": "generated_unique_id",
    "name": "nama_mata_kuliah",
    "day": "", // Kosong jika tidak ada informasi hari
    "startTime": "", // Kosong jika tidak ada informasi jam mulai
    "endTime": "", // Kosong jika tidak ada informasi jam selesai
    "room": "", // Kosong jika tidak ada informasi ruangan
    "lecturer": ["nama_dosen"], // Minimal harus ada, gunakan "TBA" jika tidak ada
    "meeting": 0, // Buat meeting awal adalah 0 semua
    "category": "High"
  }
]

Contoh untuk mata kuliah DENGAN jadwal:
{
  "name": "Algoritma dan Pemrograman",
  "day": "Monday",
  "startTime": "08:00",
  "endTime": "10:00",
  "room": "K201"
}

Contoh untuk mata kuliah TANPA jadwal:
{
  "name": "Skripsi",
  "day": "",
  "startTime": "",
  "endTime": "",
  "room": ""
}

Pastikan JSON valid dan tidak ada teks tambahan di luar JSON array.
    `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite-preview-06-17",
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
    let subjects: ParsedSubject[];
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

      // Generate unique IDs if not provided
      subjects = parsedData.map(
        (subject: RawSubject, index: number): ParsedSubject => ({
          id: subject.id || `irs_${Date.now()}_${index}`,
          name: subject.name || "Subject",
          day: subject.day || "", // Empty string instead of "Monday"
          startTime: subject.startTime || "", // Empty string instead of "08:00"
          endTime: subject.endTime || "", // Empty string instead of "10:00"
          room: subject.room || "", // Empty string instead of "TBA"
          lecturer: Array.isArray(subject.lecturer)
            ? subject.lecturer.filter((l) => l && l.trim()) // Filter out empty lecturers
            : subject.lecturer && subject.lecturer.trim()
            ? [subject.lecturer]
            : ["TBA"], // Only set TBA if completely empty
          meeting: subject.meeting || 0,
          category: subject.category || "Medium",
        })
      );

      console.log(`Successfully parsed ${subjects.length} subjects`);
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
    if (!Array.isArray(subjects) || subjects.length === 0) {
      console.log("ERROR: Tidak ada mata kuliah yang ditemukan");
      return NextResponse.json(
        {
          error:
            "Tidak dapat menemukan jadwal kuliah dalam gambar. Pastikan gambar IRS jelas dan terbaca.",
        },
        { status: 400 }
      );
    }

    console.log(
      `=== SUCCESS: ${subjects.length} mata kuliah berhasil diekstrak ===`
    );
    console.log(`Total processing time: ${Date.now() - startTime}ms`);

    return NextResponse.json({
      success: true,
      subjects: subjects,
      message: `Berhasil mengekstrak ${subjects.length} mata kuliah dari IRS`,
    });
  } catch (error: unknown) {
    console.error("=== UPLOAD-KRS ERROR ===");
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
