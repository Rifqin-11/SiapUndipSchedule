"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  Eye,
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  Home,
  User,
  Server,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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

const UploadKRSPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Memproses...");
  const [parsedData, setParsedData] = useState<ParsedSubject[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Cleanup object URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "Format file tidak didukung. Hanya gunakan PNG, JPG, atau WEBP."
        );
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar. Maksimal 10MB.");
        return;
      }
      
      setFile(selectedFile);
      
      // Create image preview URL
      const imageUrl = URL.createObjectURL(selectedFile);
      setImagePreview(imageUrl);
      
      toast.success("File berhasil dipilih: " + selectedFile.name);
    }
  };

  const processAndParseKRS = async () => {
    if (!file) return;

    setIsProcessing(true);
    setParsedData([]);
    setShowPreview(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoadingMessage("1/3: Mengunggah file ke server...");
      
      console.log("Sending file to server:", file.name, file.type, file.size);
      console.log("FormData:", formData);
      
      console.log("Making fetch request to /api/upload-krs...");
      
      // Add timeout to fetch request (10 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes
      
      const response = await fetch("/api/upload-krs", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log("Fetch completed, response received");
      setLoadingMessage("2/3: Server sedang memproses dengan OCR dan AI... (Ini bagian terlama)");

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));
      
      console.log("Parsing response JSON...");
      const result = await response.json();
      console.log("Response data:", result);

      setLoadingMessage("3/3: Mempersiapkan hasil preview...");

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      const parsedSubjects = result.subjects;

      if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
        console.log("Parsed subjects:", parsedSubjects);
        setParsedData(parsedSubjects);
        setShowPreview(true);
        toast.success(
          `Berhasil! Ditemukan ${parsedSubjects.length} mata kuliah.`
        );
      } else {
        console.log("No subjects found in response");
        toast.error(
          "AI tidak dapat menemukan data jadwal dalam file. Pastikan gambar IRS jelas dan mengandung jadwal kuliah."
        );
      }
    } catch (error: unknown) {
      console.error("Processing Error:", error);
      
      let errorMessage = "Terjadi kesalahan saat memproses file";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Request timeout - proses memakan waktu terlalu lama (lebih dari 10 menit)";
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show more specific error messages
      if (errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
        toast.error("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      } else if (errorMessage.includes("timeout")) {
        toast.error("Proses terlalu lama. Coba dengan gambar yang lebih kecil atau lebih jelas.");
      } else if (errorMessage.includes("OCR")) {
        toast.error("Gagal membaca teks dari gambar. Pastikan gambar jelas dan terbaca.");
      } else if (errorMessage.includes("AI")) {
        toast.error("Gagal menganalisis dengan AI. Coba lagi dengan gambar yang lebih jelas.");
      } else {
        toast.error(`Gagal memproses file: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage("Memproses...");
    }
  };

  const resetUpload = () => {
    // Clean up object URL to prevent memory leak
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setFile(null);
    setImagePreview(null);
    setParsedData([]);
    setShowPreview(false);
    const fileInput = document.getElementById("krs-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const submitSchedule = async () => {
    setIsProcessing(true);
    try {
      console.log("Starting to add subjects:", parsedData);
      
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjects: parsedData }),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (response.ok && result.success) {
        toast.success(`Berhasil menambahkan ${parsedData.length} mata kuliah ke jadwal!`);
        
        // Force refresh data di semua halaman dengan mengirim event
        if (typeof window !== 'undefined') {
          // Trigger custom event untuk refresh data
          const refreshEvent = new CustomEvent('subjectsUpdated', {
            detail: { subjects: parsedData }
          });
          window.dispatchEvent(refreshEvent);
          
          // Also update localStorage untuk cache
          localStorage.setItem('lastUpdateTime', Date.now().toString());
        }
        
        // Reset form
        resetUpload();
        setParsedData([]);
        setShowPreview(false);
        
        // Redirect ke halaman schedule setelah berhasil
        setTimeout(() => {
          window.location.href = '/schedule';
        }, 2000);
      } else {
        console.error("Error response:", result);
        toast.error(result.error || "Gagal menambahkan mata kuliah");
      }
    } catch (error) {
      console.error("Error adding subjects:", error);
      toast.error("Terjadi kesalahan saat menambahkan mata kuliah");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="text-center py-8 space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <BrainCircuit className="w-6 h-6 text-blue-500 animate-pulse" />
        <Server className="w-6 h-6 text-green-500 animate-bounce" />
      </div>
      <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
        {loadingMessage}
      </p>
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>OCR</span>
        </div>
        <div className="flex items-center space-x-1">
          <BrainCircuit className="w-4 h-4" />
          <span>AI Analysis</span>
        </div>
        <div className="flex items-center space-x-1">
          <BookOpen className="w-4 h-4" />
          <span>Parsing</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit">
              <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Upload IRS
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Import jadwal kuliah dari file IRS (Isian Rencana Studi) Anda
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              Fitur AI-Powered OCR untuk IRS
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Upload gambar IRS dalam format PNG, JPG, atau WEBP</span>
              </li>
              <li className="flex items-start gap-2">
                <Server className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Sistem akan membaca teks dengan OCR menggunakan Azure Computer Vision</span>
              </li>
              <li className="flex items-start gap-2">
                <BrainCircuit className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Gemini AI akan menganalisis dan mengekstrak jadwal kuliah secara otomatis</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Preview akan ditampilkan sebelum data disimpan ke jadwal</span>
              </li>
            </ul>
          </div>
        </header>

        {!showPreview ? (
          /* Upload Section */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            {isProcessing ? (
              <LoadingComponent />
            ) : (
              <>
                {!file && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 text-center transition-all hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-700/50">
                    <input
                      type="file"
                      id="krs-upload"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="krs-upload"
                      className={`cursor-pointer flex flex-col items-center ${
                        isProcessing ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Klik untuk pilih file atau drag & drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, atau WEBP (maks. 10MB)
                      </p>
                    </label>
                  </div>
                )}

                {file && (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Preview Gambar IRS:
                        </h3>
                        <div className="flex justify-center">
                          <Image
                            src={imagePreview}
                            alt="Preview IRS"
                            width={800}
                            height={600}
                            className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                            unoptimized
                          />
                        </div>
                      </div>
                    )}

                    {/* File Info */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden min-w-0">
                          <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="overflow-hidden min-w-0">
                            <p
                              className="font-medium text-green-900 dark:text-green-200 truncate"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <span className="text-sm text-green-700 dark:text-green-300">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={resetUpload}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 w-full sm:w-auto"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus & Upload Ulang
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={processAndParseKRS}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4 mr-2" />
                          Proses dengan AI & OCR
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Preview Section */
          <div className="space-y-4 sm:space-y-6">
            {/* Preview Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    Preview Jadwal dari IRS (Hasil AI)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {parsedData.length} mata kuliah berhasil diekstrak
                  </p>
                </div>
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  className="text-gray-600 w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Ulang
                </Button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4 p-4">
                {parsedData.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="space-y-3">
                      {/* Subject Name & Category */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white break-words">
                          {subject.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                            subject.category === "High"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : subject.category === "Medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {subject.category}
                        </span>
                      </div>

                      {/* Day & Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{subject.day}</span>
                        <Clock className="w-4 h-4 flex-shrink-0 ml-2" />
                        <span>{subject.startTime} - {subject.endTime}</span>
                      </div>

                      {/* Room */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Home className="w-4 h-4 flex-shrink-0" />
                        <span>{subject.room}</span>
                      </div>

                      {/* Lecturer */}
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <User className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          {subject.lecturer.map((lecturer, idx) => (
                            <div key={idx} className="break-words">
                              {lecturer}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex justify-end">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          <Check className="w-3 h-3 mr-1" />
                          Siap Import
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Mata Kuliah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Hari & Waktu
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Home className="w-4 h-4 inline mr-1" />
                        Ruangan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <User className="w-4 h-4 inline mr-1" />
                        Dosen
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {parsedData.map((subject, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
                              {subject.name}
                            </div>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                subject.category === "High"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  : subject.category === "Medium"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              }`}
                            >
                              {subject.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {subject.day}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {subject.startTime} - {subject.endTime}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          <div className="max-w-xs break-words">
                            {subject.room}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                            {subject.lecturer.map((lecturer, idx) => (
                              <div key={idx} className="break-words">
                                {lecturer}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Check className="w-3 h-3 mr-1" />
                            Siap Import
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center sm:text-left">
                  Total {parsedData.length} mata kuliah akan ditambahkan ke jadwal Anda.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full sm:w-auto sm:flex-1 order-2 sm:order-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={submitSchedule}
                    disabled={isProcessing}
                    className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Simpan ke Jadwal Saya
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <footer className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200">
                Cara Menggunakan Upload IRS
              </h3>
              <div className="text-blue-800 dark:text-blue-300 text-sm mt-1 space-y-1">
                <p>1. <strong>Upload Gambar:</strong> Drag & drop atau klik untuk pilih file IRS (PNG, JPG, WEBP)</p>
                <p>2. <strong>Preview:</strong> Gambar yang dipilih akan ditampilkan sebagai preview</p>
                <p>3. <strong>Proses AI:</strong> Klik tombol &quot;Proses dengan AI & OCR&quot; untuk analisis otomatis</p>
                <p>4. <strong>Review & Simpan:</strong> Periksa hasil ekstraksi jadwal dan simpan ke aplikasi</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UploadKRSPage;
