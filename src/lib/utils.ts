import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SECTORS = [
  { key: 'sales',            icon: '💼' },
  { key: 'marketing',        icon: '📣' },
  { key: 'customer_service', icon: '🎧' },
  { key: 'admin',            icon: '🗂️' },
  { key: 'it',               icon: '💻' },
  { key: 'engineering',      icon: '⚙️' },
  { key: 'healthcare',       icon: '🏥' },
  { key: 'education',        icon: '📚' },
  { key: 'hospitality',      icon: '🏨' },
  { key: 'construction',     icon: '🏗️' },
  { key: 'logistics',        icon: '🚚' },
  { key: 'finance',          icon: '💰' },
] as const;

export const CITIES = [
  'Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam',
  'Khobar', 'Dhahran', 'Abha', 'Tabuk', 'Qassim',
  'Hail', 'Jizan', 'Najran', 'Remote',
];

export const JOB_TYPES = ['full-time', 'part-time', 'contract', 'freelance'] as const;
