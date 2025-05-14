import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a tailwind grid column class based on the number of items
 */
export function getGridColumns(count: number): string {
  const columns = Math.min(count, 5); // Max 5 columns
  return `grid-cols-${columns}`;
}
