import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { QueueItem, QueueStatus } from "@/src/types/queue.types";
import { useToast } from "../hooks/use-toast.hook";
import { queueItemService } from "../services/queue.service";
import { Button } from "./ui/Button.component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog.component";
import { Label } from "./ui/Label.component";

interface QueueItemStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  queueItem: QueueItem;
  statuses: QueueStatus[];
}

const updateStatusSchema = z.object({
  statusId: z.string().min(1, "Status is required"),
});

type FormValues = z.infer<typeof updateStatusSchema>;

export function QueueItemStatusModal({
  open,
  onClose,
  onSuccess,
  queueItem,
  statuses,
}: QueueItemStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const { success, error, loading: toastLoading } = useToast();

  const currentStatus = statuses.find((s) => s.id === queueItem.statusId);
  const nextStatusIndex = currentStatus
    ? statuses.findIndex((s) => s.id === currentStatus.id) + 1
    : 0;
  const nextStatus = nextStatusIndex < statuses.length ? statuses[nextStatusIndex] : null;

  const form = useForm<FormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      statusId: nextStatus?.id || statuses[0]?.id || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    toastLoading("Updating status...", { id: "update-status" });

    try {
      setLoading(true);
      await queueItemService.updateQueueItem(queueItem.id, {
        statusId: values.statusId,
      });

      form.reset();
      onSuccess?.();
      onClose();
      success("Status updated successfully!", {
        id: "update-status",
        description: `${queueItem.queueNumber} - ${queueItem.name}`,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      error("Failed to update status", {
        id: "update-status",
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Queue Item Status</DialogTitle>
          <DialogDescription>
            Change the status of queue item {queueItem.queueNumber} - {queueItem.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div className="space-y-2">
              <Label>Current Status</Label>
              {currentStatus && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentStatus.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{currentStatus.label}</span>
                </div>
              )}
            </div>

            {/* New Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="statusId">New Status</Label>
              <select
                id="statusId"
                {...form.register("statusId")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.statusId && (
                <p className="text-sm text-red-600">{form.formState.errors.statusId.message}</p>
              )}
            </div>

            {/* Quick Actions */}
            {nextStatus && (
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status.id}
                      type="button"
                      onClick={() => form.setValue("statusId", status.id)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium text-white transition-all ${
                        form.watch("statusId") === status.id
                          ? "ring-2 ring-offset-2 ring-blue-500"
                          : "hover:opacity-90"
                      }`}
                      style={{ backgroundColor: status.color }}
                      disabled={loading}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
