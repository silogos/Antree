import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="max-w-md">
      <DialogContent>
        <div className="flex items-start gap-3 mb-4">
          {variant === "destructive" && (
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <DialogTitle className={variant === "destructive" ? "text-red-900" : ""}>
              {title}
            </DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
