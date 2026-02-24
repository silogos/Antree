import { X } from "lucide-react";
import type * as React from "react";

export function Dialog({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col ${className || "max-w-5xl"}`}
        >
          {children}
        </div>
      </div>
    </>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b border-gray-200 px-6 py-4">{children}</div>;
}

export function DialogTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`text-xl font-semibold text-gray-900 ${className || ""}`}>{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-600 mt-1">{children}</p>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>;
}

export function DialogFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-gray-200 px-6 py-4 flex justify-end gap-2 ${className || ""}`}>
      {children}
    </div>
  );
}

export function DialogClose({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500"
    >
      <X className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Close</span>
    </button>
  );
}
