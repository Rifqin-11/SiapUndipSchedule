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
  Home,
  User,
  Server,
  BrainCircuit,
  Edit2,
  Save,
  XCircle,
  Trash2,
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

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

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
  const [loadingMessage, setLoadingMessage] = useState("Processing...");
  const [parsedData, setParsedData] = useState<ParsedSubject[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ParsedSubject | null>(null);
  const [startDate, setStartDate] = useState<string>("");

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
          "File format not supported. Please use PNG, JPG, or WEBP only."
        );
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File size too large. Maximum 10MB.");
        return;
      }

      setFile(selectedFile);

      // Create image preview URL
      const imageUrl = URL.createObjectURL(selectedFile);
      setImagePreview(imageUrl);

      toast.success("File successfully selected: " + selectedFile.name);
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
      setLoadingMessage("1/3: Uploading file to server...");

      // Add timeout to fetch request (10 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutes

      const response = await fetch("/api/upload-krs", {
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

      const parsedSubjects: ParsedSubject[] = result.subjects;

      if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
        setParsedData(parsedSubjects);
        setShowPreview(true);
        toast.success(`Success! Found ${parsedSubjects.length} subjects.`);
      } else {
        toast.error(
          "AI could not find schedule data in the file. Make sure the KRS image is clear and contains course schedule."
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
      } else if (errorMessage.includes("OCR")) {
        toast.error(
          "Failed to read text from image. Make sure the image is clear and readable."
        );
      } else if (errorMessage.includes("AI")) {
        toast.error(
          "Failed to analyze with AI. Try again with a clearer image."
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
    // Clean up object URL to prevent memory leak
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setFile(null);
    setImagePreview(null);
    setParsedData([]);
    setShowPreview(false);
    setEditingIndex(null);
    setEditForm(null);
    const fileInput = document.getElementById("krs-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const submitSchedule = async () => {
    if (!startDate) {
      toast.error("Please select the semester start date first");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjects: parsedData,
          startDate: startDate,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(
          `Successfully added ${parsedData.length} subjects to schedule!`
        );

        if (typeof window !== "undefined") {
          const refreshEvent = new CustomEvent("subjectsUpdated", {
            detail: { subjects: parsedData },
          });
          window.dispatchEvent(refreshEvent);
          localStorage.setItem("lastUpdateTime", Date.now().toString());
        }

        resetUpload();
        setParsedData([]);
        setShowPreview(false);

        setTimeout(() => {
          window.location.href = "/schedule";
        }, 2000);
      } else {
        toast.error(result.error || "Failed to add subjects");
      }
    } catch {
      toast.error("An error occurred while adding subjects");
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
    field: keyof ParsedSubject,
    value: string | string[]
  ) => {
    if (editForm) {
      setEditForm({
        ...editForm,
        [field]: value as never,
      });
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
    <div className="bg-background min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <header className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg w-fit">
              <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Upload IRS
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Import course schedule from your KRS (Study Plan Form) file
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              AI-Powered OCR for KRS
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2">
                <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Upload IRS image in PNG, JPG, or WEBP format</span>
              </li>
              <li className="flex items-start gap-2">
                <Server className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  System will read text with OCR using Azure Computer Vision
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BrainCircuit className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Gemini AI will analyze and extract course schedule
                  automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Preview will be displayed before data is saved to schedule
                </span>
              </li>
            </ul>
          </div>
        </header>

        {!showPreview ? (
          /* Upload Section */
          <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
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
                        Click to select file or drag & drop
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, or WEBP (max. 10MB)
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
                          KRS Image Preview:
                        </h3>
                        <div className="flex justify-center">
                          <Image
                            src={imagePreview}
                            alt="Preview KRS"
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
                      onClick={processAndParseKRS}
                      disabled={isProcessing}
                      className="w-full bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
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
                    <BrainCircuit className="w-5 h-5 text-indigo-600" />
                    Schedule Preview from KRS (AI Results)
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {parsedData.length} subjects successfully extracted
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

            {/* Preview Table */}
            <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
              {/* Mobile Card Layout */}
              <div className="block lg:hidden space-y-4 p-4">
                {parsedData.map((subject, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-background/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    {editingIndex === index ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        {/* Subject Name */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Subject Name
                          </label>
                          <Input
                            value={editForm?.name || ""}
                            onChange={(e) =>
                              handleEditFormChange("name", e.target.value)
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Day */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Day
                          </label>
                          <Select
                            value={editForm?.day || ""}
                            onValueChange={(value) =>
                              handleEditFormChange("day", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="no-schedule">
                                No Schedule
                              </SelectItem>
                              {days.map((day) => (
                                <SelectItem key={day} value={day}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Time */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Start Time
                            </label>
                            <Input
                              type="time"
                              value={editForm?.startTime || ""}
                              onChange={(e) =>
                                handleEditFormChange(
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="w-full"
                              disabled={editForm?.day === "no-schedule"}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              End Time
                            </label>
                            <Input
                              type="time"
                              value={editForm?.endTime || ""}
                              onChange={(e) =>
                                handleEditFormChange("endTime", e.target.value)
                              }
                              className="w-full"
                              disabled={editForm?.day === "no-schedule"}
                            />
                          </div>
                        </div>

                        {/* Room */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Room
                          </label>
                          <Input
                            value={editForm?.room || ""}
                            onChange={(e) =>
                              handleEditFormChange("room", e.target.value)
                            }
                            className="w-full"
                            disabled={editForm?.day === "no-schedule"}
                            placeholder={
                              editForm?.day === "no-schedule"
                                ? "No room needed"
                                : "Room"
                            }
                          />
                        </div>

                        {/* Lecturer */}
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Lecturer (separate with comma)
                          </label>
                          <Input
                            value={(editForm?.lecturer || []).join(", ")}
                            onChange={(e) =>
                              handleEditFormChange(
                                "lecturer",
                                e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter((s) => s.length > 0)
                              )
                            }
                            className="w-full"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={saveEdit}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700 flex-1"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <div className="space-y-3">
                        {/* Subject Name & Category */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white break-words">
                            {subject.name}
                          </h3>
                          <div className="flex items-center gap-2">
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
                            <Button
                              onClick={() => startEdit(index)}
                              size="sm"
                              variant="outline"
                              className="p-2"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Day & Time */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{subject.day}</span>
                          <Clock className="w-4 h-4 flex-shrink-0 ml-2" />
                          <span>
                            {subject.startTime} - {subject.endTime}
                          </span>
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
                            {subject.lecturer.map((lect, idx) => (
                              <div key={idx} className="break-words">
                                {lect}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex justify-end">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <Check className="w-3 h-3 mr-1" />
                            Ready to Import
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-background/50">
                  <thead className="bg-gray-50 dark:bg-background/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Day & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Home className="w-4 h-4 inline mr-1" />
                        Room
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <User className="w-4 h-4 inline mr-1" />
                        Lecturer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-card divide-y divide-gray-200 dark:divide-background/50">
                    {parsedData.map((subject, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-background/30 transition-colors"
                      >
                        {editingIndex === index ? (
                          /* Edit Mode Row */
                          <>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <Input
                                  value={editForm?.name || ""}
                                  onChange={(e) =>
                                    handleEditFormChange("name", e.target.value)
                                  }
                                  placeholder="Subject name"
                                  className="w-full"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <Select
                                  value={editForm?.day || ""}
                                  onValueChange={(value) =>
                                    handleEditFormChange("day", value)
                                  }
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select day" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="no-schedule">
                                      No Schedule
                                    </SelectItem>
                                    {days.map((day) => (
                                      <SelectItem key={day} value={day}>
                                        {day}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    type="time"
                                    value={editForm?.startTime || ""}
                                    onChange={(e) =>
                                      handleEditFormChange(
                                        "startTime",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Start time"
                                    className="w-full"
                                    disabled={editForm?.day === "no-schedule"}
                                  />
                                  <Input
                                    type="time"
                                    value={editForm?.endTime || ""}
                                    onChange={(e) =>
                                      handleEditFormChange(
                                        "endTime",
                                        e.target.value
                                      )
                                    }
                                    placeholder="End time"
                                    className="w-full"
                                    disabled={editForm?.day === "no-schedule"}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                value={editForm?.room || ""}
                                onChange={(e) =>
                                  handleEditFormChange("room", e.target.value)
                                }
                                placeholder={
                                  editForm?.day === "no-schedule"
                                    ? "No room needed"
                                    : "Room"
                                }
                                className="w-full"
                                disabled={editForm?.day === "no-schedule"}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <Input
                                value={(editForm?.lecturer || []).join(", ")}
                                onChange={(e) =>
                                  handleEditFormChange(
                                    "lecturer",
                                    e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter((s) => s.length > 0)
                                  )
                                }
                                placeholder="Lecturer (separate with comma)"
                                className="w-full"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                <Edit2 className="w-3 h-3 mr-1" />
                                Editing
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex gap-2">
                                <Button
                                  onClick={saveEdit}
                                  size="sm"
                                  className="bg-green-600 text-white hover:bg-green-700"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={cancelEdit}
                                  variant="outline"
                                  size="sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          /* Display Mode Row */
                          <>
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
                                {subject.lecturer.map((lect, idx) => (
                                  <div key={idx} className="break-words">
                                    {lect}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <Check className="w-3 h-3 mr-1" />
                                Ready to Import
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <Button
                                onClick={() => startEdit(index)}
                                size="sm"
                                variant="outline"
                                className="p-2"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white dark:bg-card rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-200 font-medium text-center sm:text-left">
                  Total {parsedData.length} subjects will be added to your
                  schedule.
                </p>

                {/* Semester Start Date Input */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-medium text-blue-900 dark:text-blue-200">
                        Semester Start Date
                      </h3>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Select when your semester starts. This will be used to
                      calculate 14 meeting dates for each subject.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <label className="text-sm font-medium text-blue-900 dark:text-blue-200 min-w-fit">
                        Start Date:
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="flex-1 max-w-xs border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {!startDate && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please select the semester start date before saving
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                    disabled={isProcessing}
                    className="w-full sm:w-auto sm:flex-1 order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitSchedule}
                    disabled={isProcessing || !startDate}
                    className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto sm:flex-1 order-1 sm:order-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Save to My Schedule
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
                How to Use Upload IRS
              </h3>
              <div className="text-blue-800 dark:text-blue-300 text-sm mt-1 space-y-1">
                <p>
                  1. <strong>Upload Image:</strong> Drag & drop or click to
                  select KRS file (PNG, JPG, WEBP)
                </p>
                <p>
                  2. <strong>Preview:</strong> Selected image will be displayed
                  as preview
                </p>
                <p>
                  3. <strong>AI Process:</strong> Click &quot;Process with AI
                  &amp; OCR&quot; button for automatic analysis
                </p>
                <p>
                  4. <strong>Review & Save:</strong> Check extracted schedule
                  results and save to application
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default UploadKRSPage;
