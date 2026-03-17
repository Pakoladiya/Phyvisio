export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return `${str.slice(0, len)}…`;
}

export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
