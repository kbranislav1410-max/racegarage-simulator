/**
 * Format address from street and city components
 */
export function formatAddress(street: string | null, city: string | null): string {
  if (!street && !city) return "-";
  
  const parts = [street, city].filter(Boolean);
  return parts.join(", ");
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "Never";
  return new Date(date).toLocaleDateString();
}

/**
 * Format datetime to locale string with time
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString();
}
