import { z } from "zod";

// Subject validation schema
export const SubjectSchema = z
  .object({
    name: z
      .string()
      .min(1, "Subject name is required")
      .max(100, "Subject name must be less than 100 characters")
      .trim(),

    lecturer: z
      .array(z.string().trim().min(1, "Lecturer name cannot be empty"))
      .min(1, "At least one lecturer is required")
      .max(5, "Maximum 5 lecturers allowed"),

    meeting: z
      .number()
      .int("Meeting count must be an integer")
      .min(0, "Meeting count cannot be negative")
      .max(14, "Maximum 14 meetings allowed"),

    days: z
      .array(
        z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ])
      )
      .min(1, "At least one day must be selected"),

    startTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
      .refine((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
      }, "Invalid time"),

    endTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

    category: z
      .enum(["lecture", "tutorial", "lab", "seminar", "other"])
      .optional()
      .default("lecture"),

    room: z
      .string()
      .max(50, "Room name must be less than 50 characters")
      .trim()
      .optional(),

    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format")
      .optional(),

    attendanceDates: z.array(z.string().datetime()).optional().default([]),
  })
  .refine(
    (data) => {
      // Validate end time is after start time
      const start = new Date(`2000-01-01T${data.startTime}`);
      const end = new Date(`2000-01-01T${data.endTime}`);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Task validation schema
export const TaskSchema = z.object({
  title: z
    .string()
    .min(1, "Task title is required")
    .max(200, "Task title must be less than 200 characters")
    .trim(),

  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .trim()
    .optional(),

  subject: z.string().min(1, "Subject is required").trim(),

  dueDate: z
    .string()
    .datetime("Invalid date format")
    .refine((date) => new Date(date) > new Date(), {
      message: "Due date must be in the future",
    }),

  priority: z.enum(["low", "medium", "high"]).default("medium"),

  status: z.enum(["pending", "in-progress", "completed"]).default("pending"),

  tags: z
    .array(z.string().trim().min(1))
    .max(10, "Maximum 10 tags allowed")
    .optional()
    .default([]),

  estimatedTime: z
    .number()
    .int("Estimated time must be an integer")
    .min(1, "Estimated time must be at least 1 minute")
    .max(1440, "Estimated time cannot exceed 24 hours (1440 minutes)")
    .optional(),

  attachments: z
    .array(
      z.object({
        name: z.string().min(1, "Filename is required"),
        url: z.string().url("Invalid URL format"),
        size: z.number().positive("File size must be positive").optional(),
        type: z.string().optional(),
      })
    )
    .max(5, "Maximum 5 attachments allowed")
    .optional()
    .default([]),
});

// User profile validation schema
export const UserProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),

  email: z.string().email("Invalid email format").toLowerCase(),

  nim: z
    .string()
    .regex(/^[0-9]{14}$/, "NIM must be exactly 14 digits")
    .optional(),

  jurusan: z
    .string()
    .max(100, "Department name must be less than 100 characters")
    .trim()
    .optional(),

  fakultas: z
    .string()
    .max(100, "Faculty name must be less than 100 characters")
    .trim()
    .optional(),

  angkatan: z
    .string()
    .regex(/^20[0-9]{2}$/, "Invalid year format (e.g., 2023)")
    .optional(),

  profileImage: z.string().url("Invalid profile image URL").optional(),
});

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must be less than 128 characters"),
});

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .trim(),

    email: z.string().email("Invalid email format").toLowerCase(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// Types derived from schemas
export type Subject = z.infer<typeof SubjectSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type ApiResponse<T = any> = z.infer<typeof ApiResponseSchema> & {
  data?: T;
};

// Validation helper functions
export function validateSubject(
  data: unknown
): { success: true; data: Subject } | { success: false; errors: string[] } {
  try {
    const validData = SubjectSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

export function validateTask(
  data: unknown
): { success: true; data: Task } | { success: false; errors: string[] } {
  try {
    const validData = TaskSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(
          (err) => `${err.path.join(".")}: ${err.message}`
        ),
      };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}
