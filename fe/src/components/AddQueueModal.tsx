import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { QueueStatus } from '../types';
import { useQueues } from '../hooks/useQueues';

interface AddQueueModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  statuses?: QueueStatus[];
  boardId: string;
}

const createQueueSchema = z.object({
  queueNumber: z.string().min(1, 'Queue number is required'),
  name: z.string().min(1, 'Name is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  duration: z.string().min(1, 'Duration is required'),
  statusId: z.string().min(1, 'Status is required'),
});

type FormValues = z.infer<typeof createQueueSchema>;

export function AddQueueModal({
  open,
  onClose,
  onSuccess,
  statuses = [],
  boardId
}: AddQueueModalProps) {
  const [loading, setLoading] = useState(false);
  const { createQueue } = useQueues({ boardId });

  const form = useForm<FormValues>({
    resolver: zodResolver(createQueueSchema),
    defaultValues: {
      queueNumber: '',
      name: '',
      customerName: '',
      duration: '',
      statusId: statuses.length > 0 ? statuses[0].id : ''
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      await createQueue({
        boardId,
        queueNumber: values.queueNumber,
        name: values.name,
        statusId: values.statusId,
        metadata: {
          customerName: values.customerName,
          duration: values.duration,
        }
      });

      form.reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create queue:', error);
      alert('Failed to create queue. Please try again.');
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
                {...form.register('queueNumber')}
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
                {...form.register('name')}
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
                {...form.register('customerName')}
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
                {...form.register('duration')}
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
                {...form.register('statusId')}
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
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Queue Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

