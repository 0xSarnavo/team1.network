import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex w-32 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full border border-zinc-200 bg-white p-2 text-center font-semibold text-zinc-900 transition-all duration-300 hover:border-[#FF394A] hover:bg-[#FF394A] hover:text-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-[#FF394A] dark:hover:bg-[#FF394A] dark:hover:text-white",
        className,
      )}
      {...props}
    >
      <span>{text}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
