
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to get grid columns based on item count
export function getGridColumns(count: number): string {
  count = Math.min(count, 5); // Max 5 columns
  
  return `grid-cols-1 sm:grid-cols-${count <= 2 ? count : 2} md:grid-cols-${count <= 3 ? count : 3} lg:grid-cols-${count}`;
}
