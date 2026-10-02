import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * Standard shadcn/ui helper: <Button className={cn("px-2", isActive && "px-4")} />
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}