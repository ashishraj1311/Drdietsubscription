import { cn } from "@/lib/cn";

/**
 * Chip — selectable pill used throughout the wizard and checkout
 * (meal slots, diet types, delivery-instruction presets, delivery slots).
 * Presentational + controlled: parent owns `selected` and handles `onClick`.
 * Locked chips (e.g. mandatory Lunch/Dinner) use `disabled` + `selected`.
 */
type ChipProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  selected?: boolean;
};

export function Chip({
  className,
  selected = false,
  disabled,
  children,
  ...props
}: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-light"
          : "border-border bg-surface text-primary hover:border-neutral",
        disabled && "opacity-55 pointer-events-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
