import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
};

/** Shared field frame: label on top, hint/error below. */
function Field({
  id,
  label,
  hint,
  error,
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const controlBase =
  "w-full rounded-md border bg-surface px-3.5 py-2.5 text-sm text-primary placeholder:text-neutral transition-shadow focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15 disabled:opacity-55 disabled:cursor-not-allowed";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    FieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <Field id={fieldId} label={label} hint={hint} error={error}>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            controlBase,
            error ? "border-danger" : "border-border",
            className,
          )}
          {...props}
        />
      </Field>
    );
  },
);
Input.displayName = "Input";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    FieldProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <Field id={fieldId} label={label} hint={hint} error={error}>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          className={cn(
            controlBase,
            "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
            error ? "border-danger" : "border-border",
            className,
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237A8570' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {children}
        </select>
      </Field>
    );
  },
);
Select.displayName = "Select";
