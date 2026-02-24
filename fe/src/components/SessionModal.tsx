import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, CheckCircle2, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { QueueSession, QueueTemplate, QueueTemplateStatus } from "../types";
import { useToast } from "../hooks/use-toast";
import { sessionService } from "../services/session.service";
import { templateService } from "../services/template.service";
import http from "../services/http";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/Card";

interface SessionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  queueId: string;
  queueTemplateId?: string; // Kept for backward compatibility
  session?: QueueSession | null;
}

interface TemplateWithStatuses extends QueueTemplate {
  statuses?: QueueTemplateStatus[];
}

// Simplified schema - templateId is derived from queue, not required
const sessionSchema = z.object({
  name: z.string().min(1, "Title is required"),
});

type FormValues = z.infer<typeof sessionSchema>;

export function SessionModal({
  open,
  onClose,
  onSuccess,
  queueId,
  queueTemplateId,
  session,
}: SessionModalProps) {
  const { error, success } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [templates, setTemplates] = useState<TemplateWithStatuses[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
    },
  });

  // Fetch templates with statuses
  useEffect(() => {
    async function fetchTemplates() {
      if (!open || isEditing) return; // Don't fetch if editing or not open

      setTemplatesLoading(true);
      try {
        const response = await templateService.getTemplates();
        if (response.success && response.data) {
          // Fetch statuses for each template
          const templatesWithStatuses = await Promise.all(
            response.data.map(async (template) => {
              try {
                const statusesResponse = await http.get<{ success: boolean; data?: QueueTemplateStatus[] }>(
                  `/templates/${template.id}/statuses`,
                );
                return {
                  ...template,
                  statuses: statusesResponse.success ? statusesResponse.data || [] : [],
                };
              } catch {
                return {
                  ...template,
                  statuses: [],
                };
              }
            }),
          );

          // Sort templates: system templates first, then by updatedAt (most recent first)
          const sortedTemplates = templatesWithStatuses.sort((a, b) => {
            // System templates come first
            if (a.isSystemTemplate && !b.isSystemTemplate) return -1;
            if (!a.isSystemTemplate && b.isSystemTemplate) return 1;

            // Then sort by updatedAt (most recent first)
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });

          setTemplates(sortedTemplates);

          // Auto-select the queue's default template
          const defaultTemplate = sortedTemplates.find(
            (t) => t.id === queueTemplateId,
          );
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
            form.setValue("templateId", defaultTemplate.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setTemplatesLoading(false);
      }
    }

    fetchTemplates();
  }, [open, isEditing, queueTemplateId, form]);

  // Update selected template when form value changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "templateId") {
        const template = templates.find((t) => t.id === value.templateId);
        setSelectedTemplate(template || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, templates]);

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);

      if (isEditing && session) {
        const response = await sessionService.updateSession(session.id, {
          name: values.name,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to update session");
        }
      } else {
        // Use createSessionViaQueue() - backend derives templateId from queue
        const response = await sessionService.createSessionViaQueue(queueId, {
          name: values.name,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to create session");
        }
      }

      form.reset();
      onSuccess?.();
      onClose();
      success(
        isEditing ? "Session updated successfully!" : "Session created successfully!",
        { description: values.name }
      );
    } catch (error) {
      console.error("Failed to save session:", error);
      error(
        isEditing ? "Failed to update session" : "Failed to create session",
        { description: "Please try again later." }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!session) return;

    try {
      setIsDeleting(true);
      const response = await sessionService.deleteSession(session.id);

      if (!response.success) {
        throw new Error(response.error || "Failed to delete session");
      }

      onSuccess?.();
      onClose();
      success("Session deleted successfully!");
      setDeleteConfirm(false);
    } catch (error) {
      console.error("Failed to delete session:", error);
      error("Failed to delete session", { description: "Please try again later." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <>
    <Dialog open={open} onClose={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Session" : "Create New Session"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update session title below. You can also delete this session if needed."
              : "Choose a template and provide a title to create a new session."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6 py-4">
            {/* Title Field - More prominent */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold text-gray-800">
                Session Title
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Morning Shift, Afternoon Queue, VIP Service"
                {...form.register("name")}
                disabled={loading || isDeleting}
                className="text-lg font-medium placeholder:text-gray-400 placeholder:font-normal h-12"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Template Gallery - Only shown in create mode */}
            {!isEditing && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-gray-600" />
                  <Label htmlFor="templateId" className="text-base font-semibold text-gray-800">
                    Select Template
                  </Label>
                  <span className="text-red-500 ml-1">*</span>
                </div>

                {templatesLoading ? (
                  <Card className="flex flex-col items-center justify-center py-12 bg-gray-50 border-2 border-dashed border-gray-200">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
                    <p className="text-sm text-gray-500">Loading templates...</p>
                  </Card>
                ) : templates.length === 0 ? (
                  <Card className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200">
                    <p className="text-sm text-gray-500">No templates available</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-2">
                    {templates.map((template) => {
                      const isSelected = selectedTemplate?.id === template.id;
                      return (
                        <div key={template.id} className="relative">
                          <input
                            type="radio"
                            {...form.register("templateId")}
                            value={template.id}
                            className="sr-only"
                          />
                          <Card
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg h-full ${
                              isSelected
                                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md"
                                : "hover:border-gray-300 hover:bg-white"
                            }`}
                            onClick={() => {
                              form.setValue("templateId", template.id);
                              setSelectedTemplate(template);
                            }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base leading-tight flex-1">
                                  {template.name}
                                </CardTitle>
                                {isSelected && (
                                  <div className="shrink-0 mt-0.5">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                      <CheckCircle2 size={14} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              {template.isSystemTemplate && (
                                <div className="flex items-center gap-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    <span className="w-1 h-1 bg-blue-500 rounded-full mr-1"></span>
                                    System Template
                                  </span>
                                </div>
                              )}
                            </CardHeader>

                            <CardContent className="pb-3">
                              {template.description && (
                                <CardDescription className="line-clamp-2 mb-3">
                                  {template.description}
                                </CardDescription>
                              )}

                              <div className="space-y-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-gray-500">
                                    Statuses
                                  </span>
                                  <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {template.statuses?.length || 0}
                                  </span>
                                </div>
                                {template.statuses && template.statuses.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {template.statuses
                                      .sort((a, b) => a.order - b.order)
                                      .map((status) => (
                                        <span
                                          key={status.id}
                                          className="px-2 py-1 rounded-md text-xs font-semibold text-white shadow-sm"
                                          style={{ backgroundColor: status.color }}
                                          title={status.label}
                                        >
                                          {status.label}
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 italic">No statuses defined</p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                )}
                {form.formState.errors.templateId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    {form.formState.errors.templateId.message}
                  </p>
                )}
              </div>
            )}

            {isEditing && session && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700">Session Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <p className="font-medium capitalize">{session.status}</p>
                  </div>
                  {session.sessionNumber && (
                    <div>
                      <p className="text-gray-500 mb-1">Session #</p>
                      <p className="font-medium">#{session.sessionNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 mb-1">Created</p>
                    <p className="font-medium text-xs">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete Session
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading || isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isDeleting}
              className="w-full sm:w-auto font-semibold"
            >
              {loading ? "Saving..." : isEditing ? "Update Session" : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <ConfirmDialog
      open={deleteConfirm}
      onClose={() => setDeleteConfirm(false)}
      onConfirm={handleConfirmDelete}
      title="Delete Session"
      description="Are you sure you want to delete this session? This action cannot be undone."
      confirmLabel="Delete"
      variant="destructive"
      loading={isDeleting}
    />
    </>
  );
}
