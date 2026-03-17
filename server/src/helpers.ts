import { nanoid } from 'nanoid';

export function genId(): string {
  return nanoid(21);
}

export function nowISO(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function dateAtTime(daysOffset: number, hours: number, minutes: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function parseDateParam(val: string | undefined): string | null {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().replace('T', ' ').slice(0, 19);
}
