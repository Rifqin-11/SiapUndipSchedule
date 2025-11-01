import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// JWT token functions
export const generateJWTToken = (userId: string): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, JWT_SECRET);
};

export const verifyJWTToken = (token: string): { userId: string } | null => {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, JWT_SECRET as string) as {
      userId: string;
    };
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

// Remember me token functions (30 days)
export const generateRememberToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const getRememberTokenExpiration = (): Date => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30); // 30 days
  return expirationDate;
};

// Email verification token
export const generateEmailVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Password reset token
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const getPasswordResetExpiration = (): Date => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1); // 1 hour
  return expirationDate;
};

// Validate password strength
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push(
      "Password must contain at least one special character (@$!%*?&)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
