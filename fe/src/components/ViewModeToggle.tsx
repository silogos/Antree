import { cn } from "../lib/utils";
import { Switch } from "./ui/Switch";

type ViewMode = "display" | "operator";

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

export function ViewModeToggle({
  currentMode,
  onChange,
  disabled = false,
}: ViewModeToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          currentMode === "display" ? "text-blue-600" : "text-gray-500",
        )}
      >
        Display Mode
      </span>
      <Switch
        checked={currentMode === "operator"}
        onChange={(checked) => onChange(checked ? "operator" : "display")}
        disabled={disabled}
      />
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          currentMode === "operator" ? "text-blue-600" : "text-gray-500",
        )}
      >
        Operator Mode
      </span>
    </div>
  );
}
