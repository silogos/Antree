import { toast } from "sonner";

export const useToast = () => {
  return {
    toast: (message: string, data?: { description?: string; id?: string }) => {
      return toast(message, data);
    },
    success: (message: string, data?: { description?: string; id?: string }) => {
      return toast.success(message, data);
    },
    error: (message: string, data?: { description?: string; id?: string }) => {
      return toast.error(message, data);
    },
    info: (message: string, data?: { description?: string; id?: string }) => {
      return toast(message, data);
    },
    warning: (message: string, data?: { description?: string; id?: string }) => {
      return toast.warning(message, data);
    },
    loading: (message: string, data?: { description?: string; id?: string }) => {
      return toast.loading(message, data);
    },
    dismiss: (id?: string) => {
      return toast.dismiss(id);
    },
  };
};
