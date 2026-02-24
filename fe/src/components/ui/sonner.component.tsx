import { cn } from "../../lib/utils.util";
import * as React from "react";
import { Toaster as Sonner } from "sonner";


export { Toaster as Sonner };

export const Toaster = ({
  position = "top-right",
  ...props
}: React.ComponentProps<typeof Sonner>) => {
  return (
    <Sonner
      position={position}
      className={cn(
        "toaster group",
        "pointer-events-auto",
        "z-[100]",
        "w-full max-w-[350px] flex flex-col-reverse gap-2",
        "p-4",
        "space-y-2",
        "items-center",
        "sm:items-start",
        "sm:flex-row",
        "sm:justify-start",
        "sm:space-x-2",
        "sm:space-y-0",
        "group-[.toaster-top]:items-start",
        "group-[.toaster-top]:sm:items-start",
        "group-[.toaster-bottom]:items-end",
        "group-[.toaster-bottom]:sm:items-end",
        "group-[.toaster-left]:sm:justify-start",
        "group-[.toaster-right]:sm:justify-end",
        "group-[.toaster-top-left]:sm:justify-start",
        "group-[.toaster-top-right]:sm:justify-end",
        "group-[.toaster-bottom-left]:sm:justify-start",
        "group-[.toaster-bottom-right]:sm:justify-end",
        "group-[.toaster-top]:sm:flex-col",
        "group-[.toaster-bottom]:sm:flex-col",
        "group-[.toaster-left]:sm:flex-col",
        "group-[.toaster-right]:sm:flex-col",
        "group-[.toaster-top-left]:sm:flex-col",
        "group-[.toaster-top-right]:sm:flex-col",
        "group-[.toaster-bottom-left]:sm:flex-col",
        "group-[.toaster-bottom-right]:sm:flex-col",
        "group-[.toaster]:slide-in",
        "group-[.toaster-top]:slide-in-top",
        "group-[.toaster-bottom]:slide-in-bottom",
        "group-[.toaster-left]:slide-in-left",
        "group-[.toaster-right]:slide-in-right",
        "group-[.toaster-top-left]:slide-in-top-left",
        "group-[.toaster-top-right]:slide-in-top-right",
        "group-[.toaster-bottom-left]:slide-in-bottom-left",
        "group-[.toaster-bottom-right]:slide-in-bottom-right",
        "group-[.toaster]:slide-out",
        "group-[.toaster-top]:slide-out-top",
        "group-[.toaster-bottom]:slide-out-bottom",
        "group-[.toaster-left]:slide-out-left",
        "group-[.toaster-right]:slide-out-right",
        "group-[.toaster-top-left]:slide-out-top-left",
        "group-[.toaster-top-right]:slide-out-top-right",
        "group-[.toaster-bottom-left]:slide-out-bottom-left",
        "group-[.toaster-bottom-right]:slide-out-bottom-right",
        props.className
      )}
      {...props}
    />
  );
};