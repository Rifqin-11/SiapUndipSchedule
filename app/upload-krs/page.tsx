"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubjects } from "@/hooks/useSubjects";
import { useRouter } from "next/navigation";

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
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSubject[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const { createSubject } = useSubjects();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
        "application/pdf",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "Format file tidak didukung. Gunakan Excel (.xlsx), CSV, atau PDF"
        );
        return;
      }

      if (selectedFile.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Ukuran file terlalu besar. Maksimal 5MB");
        return;
      }

      setFile(selectedFile);
      toast.success("File berhasil dipilih");
    }
  };

  const parseKRSFile = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-krs", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setParsedData(result.data);
        setShowPreview(true);
        toast.success("File KRS berhasil diparse!");
      } else {
        toast.error(result.error || "Gagal memparse file KRS");
      }
    } catch (error) {
      toast.error("Gagal memparse file KRS");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const submitSchedule = async () => {
    setIsUploading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const subject of parsedData) {
        const result = await createSubject(subject);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(
          `Berhasil menambahkan ${successCount} mata kuliah ke jadwal`
        );

        if (errorCount === 0) {
          // Redirect to schedule page
          setTimeout(() => {
            router.push("/schedule");
          }, 1500);
        }
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} mata kuliah gagal ditambahkan`);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan jadwal");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setParsedData([]);
    setShowPreview(false);
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch("/api/upload-krs/template");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "template-krs.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Template berhasil didownload!");
      } else {
        toast.error("Gagal mendownload template");
      }
    } catch (error) {
      toast.error("Gagal mendownload template");
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Upload KRS
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Import jadwal kuliah dari file KRS Anda
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Petunjuk Upload KRS:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Format yang didukung: Excel (.xlsx), CSV, atau PDF</li>
            <li>• Maksimal ukuran file: 5MB</li>
            <li>
              • Pastikan data KRS mencakup: Nama MK, Hari, Waktu, Ruangan, Dosen
            </li>
            <li>• Preview akan ditampilkan sebelum data disimpan ke jadwal</li>
          </ul>
        </div>
      </div>

      {!showPreview ? (
        /* Upload Section */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pilih File KRS
          </h2>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              id="krs-upload"
              className="hidden"
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={handleFileChange}
            />
            <label
              htmlFor="krs-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Klik untuk pilih file atau drag & drop
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Excel, CSV, atau PDF (maksimal 5MB)
              </p>
            </label>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-200">
                      {file.name}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          )}

          {/* Parse Button */}
          {file && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={parseKRSFile}
                disabled={isUploading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Parse File KRS
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Preview Section */
        <div className="space-y-6">
          {/* Preview Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Preview Jadwal dari KRS
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {parsedData.length} mata kuliah ditemukan
                </p>
              </div>
              <Button
                onClick={resetUpload}
                variant="outline"
                className="text-gray-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Ulang
              </Button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mata Kuliah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hari & Waktu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ruangan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Dosen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {subject.name}
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.day}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.startTime} - {subject.endTime}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {subject.room}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {subject.lecturer.map((lecturer, idx) => (
                            <div key={idx} className="truncate max-w-xs">
                              {lecturer}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Konfirmasi Import
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {parsedData.length} mata kuliah akan ditambahkan ke jadwal
                  Anda
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  disabled={isUploading}
                >
                  Batal
                </Button>
                <Button
                  onClick={submitSchedule}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Import ke Jadwal
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Template */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                Butuh Template KRS?
              </h3>
              <p className="text-amber-800 dark:text-amber-300 text-sm">
                Download template Excel untuk format yang sesuai
              </p>
            </div>
          </div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadKRSPage;
