import { generateTimeSlots, getDayName, isValidDateOnly, isValidTime } from './date-time.helper';

describe('date-time.helper', () => {
  it('valida fechas y horas en los formatos de la API', () => {
    expect(isValidDateOnly('2026-11-20')).toBe(true);
    expect(isValidDateOnly('2026-02-30')).toBe(false);
    expect(isValidTime('19:00')).toBe(true);
    expect(isValidTime('25:00')).toBe(false);
  });

  it('obtiene el día y genera intervalos de 30 minutos', () => {
    expect(getDayName('2026-11-20')).toBe('viernes');
    expect(generateTimeSlots('18:00', '20:00')).toEqual(['18:00', '18:30', '19:00', '19:30']);
  });
});
