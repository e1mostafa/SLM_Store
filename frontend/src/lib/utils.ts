import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'EGP') {
  return `${currency} ${price.toLocaleString('en-EG')}`;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function generateSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getDiscountPercent(original: number, sale: number) {
  return Math.round(((original - sale) / original) * 100);
}

export function getTimeLeft(endDate: Date | string) {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return null;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, total: diff };
}
