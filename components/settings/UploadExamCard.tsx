"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Eye,
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  Server,
  BrainCircuit,
  Edit2,
  Save,
  XCircle,
  Trash2,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAutoSyncSubject } from "@/hooks/useAutoSyncSubject";
import { Subject } from "@/hooks/useSubjects";

interface ParsedExamSchedule {
  id: string;
  name: string;
  examDate: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
  room: string;
  examType: "UTS" | "UAS";
}

const UploadExamCardPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [parsedData, setParsedData] = useState<ParsedExamSchedule[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ParsedExamSchedule | null>(null);

  // Periode UTS/UAS
  const [periodStartDate, setPeriodStartDate] = useState<string>("");
  const [periodEndDate, setPeriodEndDate] = useState<string>("");
  const [examType, setExamType] = useState<"UTS" | "UAS">("UTS");

  // Auto-sync integration
  const { syncSubjectToCalendar } = useAutoSyncSubject();

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
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "application/pdf",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error(
          "File format not supported. Please use PNG, JPG, WEBP, or PDF only."
        );
        return;
      }
      if (selectedFile.size > 15 * 1024 * 1024) {
        toast.error("File size too large. Maximum 15MB.");
        return;
      }

      setFile(selectedFile);

      // Create image preview URL (only for images)
      if (selectedFile.type.startsWith("image/")) {
        const imageUrl = URL.createObjectURL(selectedFile);
        setImagePreview(imageUrl);
      } else {
        setImagePreview(null);
      }

      toast.success("File successfully selected: " + selectedFile.name);
    }
  };

  const processAndParseExamCard = async () => {
    if (!file) return;

    if (!periodStartDate || !periodEndDate) {
      toast.error("Please enter the exam period dates first");
      return;
    }

    // Validate dates
    const start = new Date(periodStartDate);
    const end = new Date(periodEndDate);
    if (end < start) {
      toast.error("End date must be after start date");
      return;
    }

    setIsProcessing(true);
    setParsedData([]);
    setShowPreview(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("examType", examType);
    formData.append("periodStartDate", periodStartDate);
    formData.append("periodEndDate", periodEndDate);

    try {
      setLoadingMessage("1/3: Uploading file to server...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

      const response = await fetch("/api/upload-exam-card", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      setLoadingMessage(
        "2/3: Server is processing with OCR and AI... (This is the longest part)"
      );

      const result = await response.json();

      setLoadingMessage("3/3: Preparing preview results...");

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.status}`);
      }

      const parsedExams: ParsedExamSchedule[] = result.exams;

      if (Array.isArray(parsedExams) && parsedExams.length > 0) {
        setParsedData(parsedExams);
        setShowPreview(true);
        toast.success(`Success! Found ${parsedExams.length} exam schedules.`);
      } else {
        toast.error(
          "AI could not find exam schedule data in the file. Make sure the image is clear."
        );
      }
    } catch (error: unknown) {
      let errorMessage = "An error occurred while processing the file";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "Request timeout - process took too long (more than 10 minutes)";
        } else {
          errorMessage = error.message;
        }
      }

      if (
        errorMessage.includes("fetch") ||
        errorMessage.includes("Failed to fetch")
      ) {
        toast.error(
          "Failed to connect to server. Check your internet connection."
        );
      } else if (errorMessage.includes("timeout")) {
        toast.error(
          "Process took too long. Try with a smaller or clearer image."
        );
      } else {
        toast.error(`Failed to process file: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
      setLoadingMessage("Processing...");
    }
  };

  const resetUpload = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFile(null);
    setImagePreview(null);
    setParsedData([]);
    setShowPreview(false);
    setEditingIndex(null);
    setEditForm(null);
    const fileInput = document.getElementById(
      "exam-card-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const submitExamSchedule = async () => {
    if (!periodStartDate || !periodEndDate) {
      toast.error("Please enter the exam period dates");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/subjects/exam-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exams: parsedData,
          periodStartDate,
          periodEndDate,
          examType,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(
          `Successfully added ${parsedData.length} exam schedules and shifted regular classes!`
        );

        // Auto-sync all inserted exam subjects and updated regular subjects to Google Calendar
        if (result.insertedSubjects && Array.isArray(result.insertedSubjects)) {
          console.log(
            "🔄 Auto-syncing exam subjects to Google Calendar:",
            result.insertedSubjects.length
          );
          for (const subject of result.insertedSubjects) {
            await syncSubjectToCalendar(subject as Subject);
          }
        }

        if (result.updatedSubjects && Array.isArray(result.updatedSubjects)) {
          console.log(
            "🔄 Auto-syncing updated regular subjects to Google Calendar:",
            result.updatedSubjects.length
          );
          for (const subject of result.updatedSubjects) {
            await syncSubjectToCalendar(subject as Subject);
          }
        }

        resetUpload();
        setParsedData([]);
        setShowPreview(false);

        setTimeout(() => {
          window.location.href = "/schedule";
        }, 2000);
      } else {
        toast.error(result.error || "Failed to add exam schedules");
      }
    } catch {
      toast.error("An error occurred while adding exam schedules");
    } finally {
      setIsProcessing(false);
    }
  };

  // Editing functions
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...parsedData[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editForm) {
      const updatedData = [...parsedData];
      updatedData[editingIndex] = editForm;
      setParsedData(updatedData);
      setEditingIndex(null);
      setEditForm(null);
      toast.success("Data successfully updated");
    }
  };

  const handleEditFormChange = (
    field: keyof ParsedExamSchedule,
    value: string
  ) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value,
      });
    }
  };

  const deleteExam = (index: number) => {
    const updatedData = parsedData.filter((_, i) => i !== index);
    setParsedData(updatedData);
    toast.success("Exam schedule deleted");
  };

  // Loading Component
  const LoadingComponent = () => (
    <div className="text-center py-8 space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
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
          <Calendar className="w-4 h-4" />
          <span>Parsing</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg w-fit">
              <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Upload Kartu UTS/UAS
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Import exam schedule and automatically shift regular class
                meetings
              </p>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              AI-Powered Exam Schedule Parser
            </h3>
            <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-2">
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Upload exam card image or PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <CalendarRange className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Enter exam period - regular classes in this period will be
                  shifted to next week
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Server className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>System will extract exam schedules with OCR & AI</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Exam schedules will be added as one-time events (no repeat)
                </span>
              </li>
            </ul>
          </div>
        </header>

        {!showPreview ? (
          /* Upload Section */
          <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-6">
            {/* Exam Period Input */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarRange className="w-5 h-5 text-orange-600" />
                Exam Period Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exam Type
                  </label>
                  <Select
                    value={examType}
                    onValueChange={(v) => setExamType(v as "UTS" | "UAS")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTS">UTS (Midterm)</SelectItem>
                      <SelectItem value="UAS">UAS (Final)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Period Start Date
                  </label>
                  <Input
                    type="date"
                    value={periodStartDate}
                    onChange={(e) => setPeriodStartDate(e.target.value)}
                    placeholder="Start date"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Period End Date
                  </label>
                  <Input
                    type="date"
                    value={periodEndDate}
                    onChange={(e) => setPeriodEndDate(e.target.value)}
                    placeholder="End date"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Note:</strong> Regular classes scheduled during this
                  period will automatically be shifted to the following week to
                  accommodate the exam schedule.
                </p>
              </div>
            </div>

            <hr className="dark:border-gray-700" />

            {/* File Upload Section */}
            {isProcessing ? (
              <LoadingComponent />
            ) : (
              <>
                {!file && (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 text-center transition-all hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700/50">
                    <input
                      type="file"
                      id="exam-card-upload"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp, application/pdf"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                    <label
                      htmlFor="exam-card-upload"
                      className={`cursor-pointer flex flex-col items-center ${
                        isProcessing ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <p className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Click to select file or drag & drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, WEBP, or PDF (max. 15MB)
                      </p>
                    </label>
                  </div>
                )}

                {file && (
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="bg-gray-50 dark:bg-background/50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Exam Card Preview:
                        </h3>
                        <div className="flex justify-center">
                          <Image
                            src={imagePreview}
                            alt="Preview Exam Card"
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
                          Delete & Upload Again
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={processAndParseExamCard}
                      disabled={
                        isProcessing || !periodStartDate || !periodEndDate
                      }
                      className="w-full bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4 mr-2" />
                          Process with AI & OCR
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
            <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-orange-600" />
                    Exam Schedule Preview (AI Results)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {parsedData.length} exam schedules successfully extracted
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Period: {periodStartDate} to {periodEndDate}
                  </p>
                </div>
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  className="text-gray-600 w-full sm:w-auto dark:text-gray-200"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Again
                </Button>
              </div>
            </div>

            {/* Exam Schedule Cards */}
            <div className="space-y-3">
              {parsedData.map((exam, index) => (
                <div
                  key={exam.id}
                  className="bg-white dark:bg-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  {editingIndex === index ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            Subject Name
                          </label>
                          <Input
                            value={editForm?.name || ""}
                            onChange={(e) =>
                              handleEditFormChange("name", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            Exam Date
                          </label>
                          <Input
                            type="date"
                            value={editForm?.examDate || ""}
                            onChange={(e) =>
                              handleEditFormChange("examDate", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            Start Time
                          </label>
                          <Input
                            type="time"
                            value={editForm?.startTime || ""}
                            onChange={(e) =>
                              handleEditFormChange("startTime", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            End Time
                          </label>
                          <Input
                            type="time"
                            value={editForm?.endTime || ""}
                            onChange={(e) =>
                              handleEditFormChange("endTime", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-xs text-gray-500 dark:text-gray-400">
                            Room
                          </label>
                          <Input
                            value={editForm?.room || ""}
                            onChange={(e) =>
                              handleEditFormChange("room", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={saveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {exam.name}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                            {exam.examType}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(exam.examDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            {exam.startTime} - {exam.endTime}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 col-span-2">
                            <BookOpen className="w-4 h-4" />
                            Room: {exam.room}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(index)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => deleteExam(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Important Notice
                  </h3>
                  <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                    <li>
                      These exam schedules will be added as one-time events (not
                      repeating weekly)
                    </li>
                    <li>
                      Regular classes scheduled during the exam period (
                      {periodStartDate} to {periodEndDate}) will be
                      automatically shifted to the following week
                    </li>
                    <li>
                      This action cannot be undone. Please verify all data
                      before submitting
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={submitExamSchedule}
                  disabled={isProcessing || parsedData.length === 0}
                  className="w-full bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center disabled:opacity-50"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Adding to Schedule...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Add {parsedData.length} Exam
                      {parsedData.length !== 1 ? "s" : ""} to Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExamCardPage;
