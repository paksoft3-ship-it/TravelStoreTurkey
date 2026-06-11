import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { randomBytes } from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${minutes} ${ampm}`;
}

export function generateBookingNumber(): string {
  const prefix = 'TST';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString('hex').toUpperCase(); // 8 hex chars = 4 billion combinations
  return `${prefix}-${timestamp}-${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const TOUR_CATEGORIES = {
  FULL_DAY: 'Full Day',
  HALF_DAY: 'Half Day',
  EVENING: 'Evening',
  MULTI_DAY: 'Multi-Day',
  TRANSFER: 'Transfer',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
  FAILED: 'Failed',
} as const;

export const DRIVER_STATUS = {
  AVAILABLE: 'Available',
  ON_TOUR: 'On Tour',
  OFFLINE: 'Offline',
  BREAK: 'On Break',
} as const;
