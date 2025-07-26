"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Subject } from "@/hooks/useSubjects";
import { toast } from "sonner";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    subject: Omit<Subject, "_id">
  ) => Promise<{ success: boolean; error?: string }>;
  subject?: Subject | null;
  mode: "add" | "edit";
  preselectedDay?: string; // Hari yang sudah dipilih dari ScheduleClient
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subject,
  mode,
  preselectedDay,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    day: "",
    room: "",
    startTime: "",
    endTime: "",
    lecturer: [""],
    meeting: 1,
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes or subject changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && subject) {
        setFormData({
          name: subject.name || "",
          day: subject.day || "",
          room: subject.room || "",
          startTime: subject.startTime || "",
          endTime: subject.endTime || "",
          lecturer: Array.isArray(subject.lecturer) ? subject.lecturer : [""],
          meeting: subject.meeting || 1,
          category: subject.category || "",
        });
      } else {
        // Reset for add mode dengan hari yang sudah dipilih
        setFormData({
          name: "",
          day: preselectedDay || "",
          room: "",
          startTime: "",
          endTime: "",
          lecturer: [""],
          meeting: 1,
          category: "",
        });
      }
    }
  }, [isOpen, mode, subject, preselectedDay]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLecturerChange = (index: number, value: string) => {
    const newLecturers = [...formData.lecturer];
    newLecturers[index] = value;
    setFormData((prev) => ({
      ...prev,
      lecturer: newLecturers,
    }));
  };

  const addLecturer = () => {
    setFormData((prev) => ({
      ...prev,
      lecturer: [...prev.lecturer, ""],
    }));
  };

  const removeLecturer = (index: number) => {
    if (formData.lecturer.length > 1) {
      const newLecturers = formData.lecturer.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        lecturer: newLecturers,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Nama mata kuliah harus diisi");
      return;
    }
    if (!formData.day) {
      toast.error("Hari harus dipilih");
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Waktu mulai dan selesai harus diisi");
      return;
    }
    if (!formData.room.trim()) {
      toast.error("Ruangan harus diisi");
      return;
    }

    // Filter out empty lecturers
    const filteredLecturers = formData.lecturer.filter((l) => l.trim() !== "");
    if (filteredLecturers.length === 0) {
      toast.error("Minimal satu dosen harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      const subjectData = {
        ...formData,
        lecturer: filteredLecturers,
        id: mode === "edit" && subject ? subject.id : `${Date.now()}`, // Temporary ID for new subjects
      };

      const result = await onSave(subjectData);

      if (result.success) {
        toast.success(
          mode === "add"
            ? "Mata kuliah berhasil ditambahkan!"
            : "Mata kuliah berhasil diperbarui!"
        );
        onClose();
      } else {
        toast.error(result.error || "Terjadi kesalahan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan tak terduga");
      console.error("Error saving subject:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Tambah Mata Kuliah" : "Edit Mata Kuliah"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Masukkan detail mata kuliah baru"
              : "Perbarui detail mata kuliah"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Mata Kuliah *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Contoh: Algoritma dan Pemrograman"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="day">Hari *</Label>
            <Select
              value={formData.day}
              onValueChange={(value) => handleInputChange("day", value)}
              disabled={mode === "add" && !!preselectedDay}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih hari" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mode === "add" && preselectedDay && (
              <p className="text-xs text-gray-500">
                Mata kuliah akan ditambahkan pada hari {preselectedDay}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Waktu Mulai *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Waktu Selesai *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Ruangan *</Label>
            <Input
              id="room"
              value={formData.room}
              onChange={(e) => handleInputChange("room", e.target.value)}
              placeholder="Contoh: K201"
            />
          </div>

          <div className="space-y-2">
            <Label>Dosen *</Label>
            {formData.lecturer.map((lecturer, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={lecturer}
                  onChange={(e) => handleLecturerChange(index, e.target.value)}
                  placeholder={`Nama dosen ${index + 1}`}
                />
                {formData.lecturer.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLecturer(index)}
                  >
                    Hapus
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLecturer}
            >
              + Tambah Dosen
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meeting">Jumlah Pertemuan</Label>
              <Input
                id="meeting"
                type="number"
                min="1"
                max="20"
                value={formData.meeting}
                onChange={(e) =>
                  handleInputChange("meeting", parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                placeholder="Opsional"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Menyimpan..."
                : mode === "add"
                ? "Tambah"
                : "Perbarui"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectModal;
