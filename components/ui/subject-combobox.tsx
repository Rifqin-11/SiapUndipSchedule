"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Subject {
  id: string;
  name: string;
  lecturer: string[];
}

interface SubjectComboboxProps {
  subjects: Subject[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SubjectCombobox({
  subjects,
  value,
  onValueChange,
  placeholder = "Select subject...",
  className,
}: SubjectComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [dropdownPosition, setDropdownPosition] = React.useState<
    "bottom" | "top"
  >("bottom");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selectedSubject = subjects.find((subject) => subject.id === value);

  const filteredSubjects = subjects.filter(
    (subject) =>
      subject.name.toLowerCase().includes(search.toLowerCase()) ||
      subject.lecturer.some((lecturer) =>
        lecturer.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Close dropdown when clicking outside or pressing ESC
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSelect = (subjectId: string) => {
    onValueChange(value === subjectId ? "" : subjectId);
    setOpen(false);
    setSearch("");

    // Force close dropdown with a small delay to ensure state updates
    setTimeout(() => {
      setOpen(false);
    }, 50);
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between text-left h-auto min-h-[40px] px-3 py-2",
          selectedSubject ? "text-gray-900 dark:text-white" : "text-gray-500",
          className
        )}
        type="button"
        onClick={() => {
          if (!open && buttonRef.current) {
            // Calculate available space
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            // Set position based on available space (need at least 180px for dropdown)
            setDropdownPosition(
              spaceBelow < 180 && spaceAbove > spaceBelow ? "top" : "bottom"
            );
          }
          setOpen(!open);
        }}
      >
        <span className="flex-1 truncate text-left min-w-0 pr-2">
          {selectedSubject ? (
            <div className="truncate max-w-full">
              <div className="font-medium truncate max-w-full">
                {selectedSubject.name}
              </div>
              {selectedSubject.lecturer.length > 0 && (
                <div className="text-sm text-gray-500 truncate max-w-full">
                  {selectedSubject.lecturer[0]}
                </div>
              )}
            </div>
          ) : (
            <span>{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute left-0 right-0 z-[100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg subject-dropdown animate-in fade-in-0 zoom-in-95",
            dropdownPosition === "bottom" ? "top-full mt-1" : "bottom-full mb-1"
          )}
          style={{ zIndex: 100 }}
        >
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8"
              autoFocus
            />
          </div>
          <div className="max-h-[150px] overflow-auto">
            {filteredSubjects.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                No subject found.
              </div>
            ) : (
              filteredSubjects.map((subject) => (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleSelect(subject.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-none bg-transparent focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none",
                    value === subject.id &&
                      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-green-600",
                      value === subject.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium text-sm">{subject.name}</span>
                    {subject.lecturer.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {subject.lecturer.join(", ")}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
