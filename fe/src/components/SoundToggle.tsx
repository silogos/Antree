import { cn } from "../lib/utils";
import { Switch } from "./ui/Switch";

interface SoundToggleProps {
  soundEnabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: "on" | "off";
}

export function SoundToggle({
  soundEnabled,
  onChange,
  disabled = false,
  label,
}: SoundToggleProps) {
  const getLabel = () => {
    if (label === "on" || label === "off") return label;
    return soundEnabled ? "on" : "off";
  };

  const labelText = getLabel() === "on" ? "Sound On" : "Sound Off";

  return (
    <div className="flex items-center gap-4">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          soundEnabled ? "text-blue-600" : "text-gray-500",
        )}
      >
        {labelText}
      </span>
      <Switch checked={soundEnabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}
