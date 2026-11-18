export const DIAS_SEMANA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const;

const DAY_ALIASES: Record<string, string> = {
  sunday: 'domingo',
  monday: 'lunes',
  tuesday: 'martes',
  wednesday: 'miércoles',
  thursday: 'jueves',
  friday: 'viernes',
  saturday: 'sábado',
  miercoles: 'miércoles',
  sabado: 'sábado',
};

export function normalizeDay(value: string): string {
  const normalized = value.trim().toLowerCase();
  return DAY_ALIASES[normalized] ?? normalized;
}

export function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isValidTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = totalMinutes % (24 * 60);
  const hours = Math.floor(normalized / 60).toString().padStart(2, '0');
  const minutes = (normalized % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function addMinutesToTime(value: string, amount: number): string {
  return minutesToTime(timeToMinutes(value) + amount);
}

export function getDayName(value: string): string {
  const date = new Date(`${value}T00:00:00Z`);
  return DIAS_SEMANA[date.getUTCDay()];
}

export function getTodayInCostaRica(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Costa_Rica',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function generateTimeSlots(open: string, close: string, intervalMinutes = 30): string[] {
  const start = timeToMinutes(open);
  const end = timeToMinutes(close);
  const slots: string[] = [];

  for (let current = start; current < end; current += intervalMinutes) {
    const hours = Math.floor(current / 60).toString().padStart(2, '0');
    const minutes = (current % 60).toString().padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
  }

  return slots;
}
