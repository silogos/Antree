import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStatuses } from "../hooks/useStatuses";
import type { QueueStatus } from "../types";
import { Button } from "./ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";

interface StatusManagerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  queueId: string;
}

const statusSchema = z.object({
  label: z.string().min(1, "Status label is required"),
  color: z.string().min(1, "Color is required"),
  order: z.number().min(1, "Order is required"),
});

type FormValues = z.infer<typeof statusSchema>;

export function StatusManagerModal({
  open,
  onClose,
  onSuccess,
  queueId,
}: StatusManagerModalProps) {
  const { statuses, createStatus, updateStatus, deleteStatus } = useStatuses({
    queueId,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStatus, setEditingStatus] = useState<QueueStatus | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      label: "",
      color: "#3b82f6",
      order: 1,
    },
  });

  const isEditing = !!editingStatus;

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      if (editingStatus) {
        await updateStatus(editingStatus.id, {
          label: values.label,
          color: values.color,
          order: values.order,
        });
      } else {
        await createStatus({
          queueId,
          label: values.label,
          color: values.color,
          order: values.order,
        });
      }

      form.reset();
      setEditingStatus(null);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save status:", error);
      alert("Failed to save status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (statusId: string) => {
    if (!confirm("Are you sure you want to delete this status?")) return;

    try {
      setIsSubmitting(true);
      await deleteStatus(statusId);
      if (editingStatus?.id === statusId) {
        setEditingStatus(null);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Failed to delete status:", error);
      alert("Failed to delete status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (status: QueueStatus) => {
    setEditingStatus(status);
    form.reset({
      label: status.label,
      color: status.color,
      order: status.order,
    });
  };

  const handleCancel = () => {
    setEditingStatus(null);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Status Manager</DialogTitle>
          <DialogDescription>
            Manage queue statuses for this board. Add, edit, and delete statuses
            as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Form Side */}
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1">
            <div className="space-y-4 max-h-96 overflow-y-auto py-4">
              <div className="space-y-2">
                <Label htmlFor="label">
                  {isEditing ? "Edit Status Label" : "Status Label"}
                </Label>
                <Input
                  id="label"
                  placeholder="e.g., Waiting"
                  {...form.register("label")}
                  disabled={isSubmitting}
                />
                {form.formState.errors.label && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.label.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color *</Label>
                <Input
                  id="color"
                  type="color"
                  {...form.register("color")}
                  disabled={isSubmitting}
                  className="h-10"
                />
                <div className="flex gap-2 flex-wrap">
                  {[
                    "#ef4444",
                    "#f97316",
                    "#f59e0b",
                    "#eab308",
                    "#84cc16",
                    "#22c55e",
                    "#06b6d4",
                    "#3b82f6",
                    "#8b5cf6",
                    "#ec4899",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => form.setValue("color", color)}
                      className="w-8 h-8 rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {form.formState.errors.color && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order *</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  {...form.register("order", { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {form.formState.errors.order && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.order.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingStatus(null);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isEditing ? "Update Status" : "Add Status"}
              </Button>
            </DialogFooter>
          </form>

          {/* List Side */}
          <div className="flex-1 border-l border-gray-200 pl-4">
            <h4 className="text-sm font-semibold mb-2">
              Existing Statuses ({statuses.length})
            </h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {statuses.length === 0 && (
                <p className="text-sm text-gray-500">
                  No statuses yet. Create one to get started.
                </p>
              )}
              {statuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <GripVertical
                    className="text-gray-400 cursor-move"
                    size={16}
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: status.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {status.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order: {status.order}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(status)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(status.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
