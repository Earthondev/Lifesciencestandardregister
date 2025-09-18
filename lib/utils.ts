import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid, differenceInDays, addDays } from 'date-fns';
import { th } from 'date-fns/locale';

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date formatting utilities
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatStr, { locale: th });
  } catch {
    return '';
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

export function formatThaiDate(date: string | Date): string {
  return formatDate(date, 'dd MMMM yyyy');
}

// Date validation
export function isValidDate(date: string | Date): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
}

// Expiry checking
export function isExpired(expiryDate: string | Date): boolean {
  if (!expiryDate) return false;
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const today = new Date();
    return expiry < today;
  } catch {
    return false;
  }
}

export function isExpiringSoon(expiryDate: string | Date, days: number = 30): boolean {
  if (!expiryDate) return false;
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const today = new Date();
    const warningDate = addDays(today, days);
    return expiry <= warningDate && expiry > today;
  } catch {
    return false;
  }
}

export function getDaysUntilExpiry(expiryDate: string | Date): number {
  if (!expiryDate) return 0;
  
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    const today = new Date();
    return differenceInDays(expiry, today);
  } catch {
    return 0;
  }
}

// String utilities
export function normalizeString(str: string): string {
  if (!str) return '';
  return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
}

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// ID generation utilities
export function generateId(name: string, year?: number): string {
  const currentYear = year || new Date().getFullYear();
  const yearStr = currentYear.toString().slice(-2);
  const normalizedName = normalizeString(name).replace(/\s+/g, ' ');
  const prefix = 'LS';
  
  // This would normally check existing IDs and increment
  // For now, return a simple format
  return `${prefix}-${normalizedName}-${yearStr}-001`;
}

// Status utilities
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Unopened':
      return 'bg-blue-100 text-blue-800';
    case 'In-Use':
      return 'bg-yellow-100 text-yellow-800';
    case 'Disposed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'Unopened':
      return '📦';
    case 'In-Use':
      return '🧪';
    case 'Disposed':
      return '🗑️';
    default:
      return '❓';
  }
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCAS(cas: string): boolean {
  if (!cas) return false;
  
  const casPattern = /^\d{2,7}-\d{2}-\d$/;
  if (!casPattern.test(cas)) return false;
  
  // CAS checksum validation
  const parts = cas.split('-');
  const digits = parts[0] + parts[1];
  const checkDigit = parseInt(parts[2]);
  
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i]) * (digits.length - i);
  }
  
  return (sum % 10) === checkDigit;
}

// Number formatting
export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num)) return '0';
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '฿0';
  return `฿${amount.toLocaleString('th-TH')}`;
}

// Array utilities
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Local storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

// Error handling
export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Deep link generation
export function generateDeepLink(sheetId: string, sheetName: string, row: number, col?: number): string {
  const baseUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;
  const range = col ? `${row}:${col}` : `${row}:${row}`;
  return `${baseUrl}#gid=0&range=${range}`;
}

// QR code generation
export function generateQRCodeUrl(text: string, size: number = 200): string {
  const encodedText = encodeURIComponent(text);
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedText}`;
}
