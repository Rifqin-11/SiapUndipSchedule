import { useState, useCallback } from "react";
import { z } from "zod";

interface UseFormValidationOptions<T> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface FormErrors {
  [key: string]: string | undefined;
}

export function useFormValidation<T>({
  schema,
  initialValues = {},
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setFormValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback(
    (name: string, value: any) => {
      try {
        // Simple validation - try to parse the whole object with current values
        const testData = { ...values, [name]: value };
        schema.parse(testData);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find((err) =>
            err.path.includes(name)
          );
          if (fieldError) {
            setErrors((prev) => ({ ...prev, [name]: fieldError.message }));
            return false;
          }
        }
      }
      return true;
    },
    [schema, values]
  );

  const validateAll = useCallback(() => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path.join(".");
          formErrors[path] = err.message;
        });
        setErrors(formErrors);
        return false;
      }
    }
    return false;
  }, [schema, values]);

  const setValue = useCallback(
    (name: string, value: any) => {
      setFormValues((prev) => ({ ...prev, [name]: value }));
      setIsDirty(true);

      // Validate field on change if it has an error
      if (errors[name]) {
        validateField(name, value);
      }
    },
    [errors, validateField]
  );

  const setAllValues = useCallback((newValues: Partial<T>) => {
    setFormValues(newValues);
    setIsDirty(true);
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validateAll()) {
        return;
      }

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values as T);
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validateAll, onSubmit, values]
  );

  const reset = useCallback(() => {
    setFormValues(initialValues);
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  const hasErrors = Object.values(errors).some((error) => error !== undefined);
  const isValid = !hasErrors && Object.keys(values).length > 0;

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    hasErrors,
    isValid,
    setValue,
    setValues: setAllValues,
    validateField,
    validateAll,
    handleSubmit,
    reset,
    getFieldProps: (name: string) => ({
      value: values[name as keyof T] || "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        setValue(name, e.target.value);
      },
      onBlur: () => {
        validateField(name, values[name as keyof T]);
      },
      error: errors[name],
      "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    }),
  };
}

// Hook for async validation
export function useAsyncValidation<T>(
  validationFn: (data: T) => Promise<{ success: boolean; errors?: string[] }>
) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validate = useCallback(
    async (data: T) => {
      setIsValidating(true);
      setValidationErrors([]);

      try {
        const result = await validationFn(data);
        if (!result.success && result.errors) {
          setValidationErrors(result.errors);
        }
        return result;
      } catch (error) {
        setValidationErrors(["Validation failed"]);
        return { success: false, errors: ["Validation failed"] };
      } finally {
        setIsValidating(false);
      }
    },
    [validationFn]
  );

  return {
    validate,
    isValidating,
    validationErrors,
    clearErrors: () => setValidationErrors([]),
  };
}
