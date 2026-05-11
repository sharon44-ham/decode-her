import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn() merges Tailwind classes safely — used everywhere in components
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
