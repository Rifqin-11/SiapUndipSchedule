"use client";

import React, { useState, useEffect } from "react";
import { Subject } from "@/hooks/useSubjects";

interface SubjectFormProps {
  subject?: Subject;
  onSubmit: (subject: Omit<Subject, "_id">) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SubjectForm: React.FC<SubjectFormProps> = ({
  subject,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    day: "Monday",
    room: "",
    startTime: "",
    endTime: "",
    lecturer: [""],
    meeting: 0,
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        id: subject.id,
        name: subject.name,
        day: subject.day,
        room: subject.room,
        startTime: subject.startTime,
        endTime: subject.endTime,
        lecturer: subject.lecturer.length > 0 ? subject.lecturer : [""],
        meeting: subject.meeting,
      });
    }
  }, [subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter empty lecturers
    const filteredLecturers = formData.lecturer.filter((l) => l.trim() !== "");

    // Auto-generate category based on meeting count
    const getAutoCategory = (meetingCount: number): string => {
      if (meetingCount >= 11) {
        return "Low";
      } else {
        return "High";
      }
    };

    const subjectData = {
      ...formData,
      lecturer: filteredLecturers,
      meeting: Number(formData.meeting),
      category: getAutoCategory(formData.meeting), // Auto-generated category
    };

    onSubmit(subjectData);
  };

  const handleLecturerChange = (index: number, value: string) => {
    const newLecturers = [...formData.lecturer];
    newLecturers[index] = value;
    setFormData({ ...formData, lecturer: newLecturers });
  };

  const addLecturer = () => {
    setFormData({ ...formData, lecturer: [...formData.lecturer, ""] });
  };

  const removeLecturer = (index: number) => {
    if (formData.lecturer.length > 1) {
      const newLecturers = formData.lecturer.filter((_, i) => i !== index);
      setFormData({ ...formData, lecturer: newLecturers });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {subject ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID Mata Kuliah
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
            disabled={!!subject} // Disable editing ID for existing subjects
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Mata Kuliah
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        {/* Day and Room */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hari
            </label>
            <select
              value={formData.day}
              onChange={(e) =>
                setFormData({ ...formData, day: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ruangan
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) =>
                setFormData({ ...formData, room: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Start Time and End Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jam Mulai
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jam Selesai
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Lecturers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Dosen
          </label>
          {formData.lecturer.map((lecturer, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={lecturer}
                onChange={(e) => handleLecturerChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={`Dosen ${index + 1}`}
                required={index === 0}
              />
              {formData.lecturer.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLecturer(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Hapus
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLecturer}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Tambah Dosen
          </button>
        </div>

        {/* Meeting Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pertemuan (0-14)
          </label>
          <input
            type="number"
            min="0"
            max="14"
            value={formData.meeting}
            onChange={(e) =>
              setFormData({
                ...formData,
                meeting: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Menyimpan..." : subject ? "Update" : "Tambah"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubjectForm;
