import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueues } from "../hooks/useQueues.hook";
import type { QueueStatus } from "@/src/types/queue.types";
import { useToast } from "../hooks/use-toast.hook";
import { Button } from "./ui/Button.component";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog.component";
import { Input } from "./ui/Input.component";
import { Label } from "./ui/Label.component";

interface AddQueueModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  statuses?: QueueStatus[];
  sessionId: string;
  onCreate?: (data: any) => Promise<any>;
}

const createQueueSchema = z.object({
  queueNumber: z.string().min(1, "Queue number is required"),
  name: z.string().min(1, "Name is required"),
  customerName: z.string().min(1, "Customer name is required"),
  duration: z.string().min(1, "Duration is required"),
  statusId: z.string().min(1, "Status is required"),
});

type FormValues = z.infer<typeof createQueueSchema>;

export function AddQueueModal({
  open,
  onClose,
  onSuccess,
  statuses = [],
  sessionId,
  onCreate,
}: AddQueueModalProps) {
  const [loading, setLoading] = useState(false);
  const { createQueue } = useQueues({ sessionId });
  const { success, error, loading: toastLoading } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(createQueueSchema),
    defaultValues: {
      queueNumber: "",
      name: "",
      customerName: "",
      duration: "",
      statusId: statuses.length > 0 ? statuses[0].id : "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    toastLoading("Adding queue item...", { id: "create-queue" });

    try {
      setLoading(true);

      const queueData = {
        sessionId,
        queueNumber: values.queueNumber,
        name: values.name,
        statusId: values.statusId,
        metadata: {
          customerName: values.customerName,
          duration: values.duration,
        },
      };

      if (onCreate) {
        await onCreate(queueData);
      } else {
        await createQueue(queueData);
      }

      form.reset();
      onSuccess?.();
      onClose();
      success("Queue item added successfully!", {
        id: "create-queue",
        description: `${values.queueNumber} - ${values.name}`,
      });
    } catch (err) {
      console.error("Failed to create queue:", err);
      error("Failed to create queue", {
        id: "create-queue",
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
          <DialogTitle>Add New Queue Item</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new queue item.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="queueNumber">Queue Number *</Label>
              <Input
                id="queueNumber"
                placeholder="e.g., A001"
                {...form.register("queueNumber")}
                disabled={loading}
              />
              {form.formState.errors.queueNumber && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.queueNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                {...form.register("name")}
                disabled={loading}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                placeholder="e.g., John Doe"
                {...form.register("customerName")}
                disabled={loading}
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                placeholder="e.g., 00:15:00"
                {...form.register("duration")}
                disabled={loading}
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusId">Status *</Label>
              <select
                id="statusId"
                {...form.register("statusId")}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={loading || statuses.length === 0}
              >
                {statuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.label}
                  </option>
                ))}
              </select>
              {form.formState.errors.statusId && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.statusId.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Queue Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
