import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Utility function to convert default values based on type
export const convertDefaultValue = (type: string, defaultValue: string): any => {
  if (defaultValue === "") return undefined;

  switch (type) {
    case "number":
      return Number(defaultValue);
    case "integer":
      return parseInt(defaultValue, 10);
    case "boolean":
      return defaultValue === "true";
    default:
      return defaultValue;
  }
};