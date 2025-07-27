// File: app/api/upload-krs/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Azure Computer Vision setup
const azureEndpoint = process.env.AZURE_COMPUTER_VISION_ENDPOINT;
const azureKey = process.env.AZURE_COMPUTER_VISION_KEY;

if (!azureEndpoint || !azureKey) {
  console.error("Azure Computer Vision credentials not found in environment variables");
}

// Gemini AI setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment variables");
}
const genAI = new GoogleGenerativeAI(apiKey!);

interface ParsedSubject {
  id: string;
  name: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
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
    // 1. Parse form data dari request
    console.log("Step 1: Parsing form data...");
    console.log("Request URL:", req.url);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));
    
    const formData = await req.formData();
    console.log("FormData entries:", Array.from(formData.entries()).map(([key, value]) => [key, (value && typeof value === 'object' && 'name' in value && 'size' in value) ? `File: ${value.name} (${value.size} bytes, ${value.type})` : value]));
    
    const file = formData.get("file") as File;
    
    if (!file) {
      console.log("ERROR: File tidak ditemukan");
      console.log("Available form data keys:", Array.from(formData.keys()));
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Additional validation to ensure file is valid
    if (typeof file === 'string' || !file || !file.name || file.size === 0) {
      console.log("ERROR: File is not a valid File object");
      console.log("File type:", typeof file);
      console.log("File object:", file);
      return NextResponse.json({ error: "File is not defined" }, { status: 400 });
    }

    console.log(`File diterima: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

    // Validasi tipe file
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.log(`ERROR: File type tidak didukung: ${file.type}`);
      return NextResponse.json({ 
        error: "Format file tidak didukung. Hanya gunakan PNG, JPG, atau WEBP." 
      }, { status: 400 });
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
          'Ocp-Apim-Subscription-Key': azureKey!,
          'Content-Type': 'application/octet-stream'
        }
      });
      
      // Get operation URL from response headers
      const operationUrl = submitResponse.headers['operation-location'];
      if (!operationUrl) {
        throw new Error("Failed to get operation URL from Azure Computer Vision");
      }
      
      console.log("Azure OCR operation submitted, URL:", operationUrl);
      
      // Step 2: Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 30; // Maximum 30 attempts (30 seconds)
      
      do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const pollResponse = await axios.get(operationUrl, {
          headers: {
            'Ocp-Apim-Subscription-Key': azureKey!
          }
        });
        
        result = pollResponse.data;
        attempts++;
        console.log(`Azure OCR polling attempt ${attempts}, status: ${result.status}`);
        
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
      console.log("Teks yang diekstrak (200 karakter pertama):", rawText.substring(0, 200));
      console.log("Total karakter diekstrak:", rawText.length);

      if (!rawText || rawText.trim().length < 10) {
        console.log("ERROR: Azure OCR tidak menghasilkan teks yang cukup");
        return NextResponse.json({ 
          error: "OCR tidak berhasil mengekstrak teks dari gambar. Pastikan gambar jelas dan terbaca." 
        }, { status: 400 });
      }
      
    } catch (azureError) {
      console.error("Azure OCR Error:", azureError);
      const errorMessage = azureError instanceof Error ? azureError.message : "Azure OCR error";
      return NextResponse.json({ 
        error: `Azure OCR gagal: ${errorMessage}` 
      }, { status: 500 });
    }

    // 3. Analisis dengan Gemini AI
    console.log("Step 3: Memulai analisis dengan Gemini AI...");
    const prompt = `
Anda adalah asisten AI yang ahli dalam menganalisis dokumen IRS (Isian Rencana Studi) mahasiswa.

Dari teks hasil OCR berikut, ekstrak informasi jadwal kuliah dan kembalikan dalam format JSON array.

Teks IRS:
${rawText}

INSTRUKSI:
1. Cari semua mata kuliah yang terdaftar dalam IRS
2. Ekstrak informasi: nama mata kuliah, hari, jam mulai, jam selesai, ruangan, dan dosen
3. Gunakan format 24 jam untuk waktu (contoh: "08:00", "14:30")
4. Untuk hari, gunakan format: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu
5. Jika informasi tidak lengkap, gunakan nilai default yang masuk akal

Kembalikan HANYA JSON array dengan format berikut:
[
  {
    "id": "generated_unique_id",
    "name": "nama_mata_kuliah",
    "day": "hari_kuliah",
    "startTime": "jam_mulai",
    "endTime": "jam_selesai", 
    "room": "ruangan",
    "lecturer": ["nama_dosen"],
    "meeting": 14,
    "category": "Medium"
  }
]

Pastikan JSON valid dan tidak ada teks tambahan di luar JSON array.
    `.trim();

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    console.log("Mengirim request ke Gemini AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();
    
    console.log("Response dari Gemini AI diterima!");
    console.log("AI Response (200 karakter pertama):", aiText.substring(0, 200));

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
      subjects = parsedData.map((subject: RawSubject, index: number): ParsedSubject => ({
        id: subject.id || `irs_${Date.now()}_${index}`,
        name: subject.name || "Mata Kuliah",
        day: subject.day || "Senin",
        startTime: subject.startTime || "08:00",
        endTime: subject.endTime || "10:00",
        room: subject.room || "TBA",
        lecturer: Array.isArray(subject.lecturer) ? subject.lecturer : [subject.lecturer || "TBA"],
        meeting: subject.meeting || 14,
        category: subject.category || "Medium"
      }));
      
      console.log(`Successfully parsed ${subjects.length} subjects`);
      
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.log("Full AI Response that failed to parse:", aiText);
      return NextResponse.json({ 
        error: "AI response tidak dapat di-parse. Coba lagi dengan gambar yang lebih jelas." 
      }, { status: 500 });
    }

    // 5. Validasi hasil
    if (!Array.isArray(subjects) || subjects.length === 0) {
      console.log("ERROR: Tidak ada mata kuliah yang ditemukan");
      return NextResponse.json({ 
        error: "Tidak dapat menemukan jadwal kuliah dalam gambar. Pastikan gambar IRS jelas dan terbaca." 
      }, { status: 400 });
    }

    console.log(`=== SUCCESS: ${subjects.length} mata kuliah berhasil diekstrak ===`);
    console.log(`Total processing time: ${Date.now() - startTime}ms`);

    return NextResponse.json({ 
      success: true,
      subjects: subjects,
      message: `Berhasil mengekstrak ${subjects.length} mata kuliah dari IRS`
    });

  } catch (error: unknown) {
    console.error("=== UPLOAD-KRS ERROR ===");
    console.error("Error details:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat memproses file";
    console.error("Error message:", errorMessage);
    
    return NextResponse.json({ 
      error: errorMessage
    }, { status: 500 });
  }
}
