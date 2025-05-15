
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns a tailwind grid column class based on the number of items
 */
export function getGridColumns(count: number): string {
  // Max 5 columns, min 1
  count = Math.max(1, Math.min(count, 5));
  
  // Create responsive grid classes based on the count
  return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${count <= 3 ? count : 3} lg:grid-cols-${count}`;
}
