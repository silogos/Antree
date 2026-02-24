import { cn } from "../../lib/utils.util";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="cursor-pointer select-none">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
            checked ? "bg-blue-600" : "bg-gray-300",
            disabled && "opacity-50 cursor-not-allowed",
            className,
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200",
              checked ? "translate-x-6" : "translate-x-1",
            )}
          />
        </div>
      </label>
    </div>
  );
}
