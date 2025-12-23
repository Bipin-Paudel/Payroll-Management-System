import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // ✅ base: matches SelectTrigger + global controls (44px)
        "flex h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs",
        "transition-colors outline-none",
        "placeholder:text-muted-foreground",
        // ✅ consistent focus ring
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        // ✅ invalid state
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-invalid:ring-offset-2 aria-invalid:ring-offset-background",
        // ✅ file input styling
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // ✅ disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
