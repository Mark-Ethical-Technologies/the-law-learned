/**
 * Penalty rate calculator for Australian modern awards.
 *
 * Multipliers are indicative and based on common Fair Work award structures.
 * Users should verify their specific award and classification via Fair Work Australia.
 */

export type ShiftType =
  | "ordinary"
  | "saturday"
  | "sunday"
  | "public_holiday"
  | "night";

const MULTIPLIERS: Record<ShiftType, number> = {
  ordinary: 1.0,
  saturday: 1.25,
  sunday: 1.5,
  public_holiday: 2.25,
  night: 1.15,
};

export interface ShiftPayResult {
  multiplier: number;
  grossPay: number;
}

/**
 * Calculate gross pay for a shift given a base rate, shift type, and hours worked.
 *
 * @param baseRate    - Ordinary hourly rate in AUD
 * @param shiftType   - One of the ShiftType values
 * @param ordinaryHours - Hours worked in the shift (after break deduction)
 */
export function calculateShiftPay(
  baseRate: number,
  shiftType: string,
  ordinaryHours: number
): ShiftPayResult {
  const multiplier = MULTIPLIERS[shiftType as ShiftType] ?? 1.0;
  const grossPay = Math.round(baseRate * multiplier * ordinaryHours * 100) / 100;
  return { multiplier, grossPay };
}

export interface AwardLevel {
  label: string;
  rate: number;
}

export interface CommonAwardRates {
  [awardKey: string]: {
    name: string;
    levels: AwardLevel[];
  };
}

/**
 * Common award base rates (AUD/hr) — FY2024-25.
 * Level 1 is the entry-level rate for each award.
 */
export const COMMON_AWARD_BASE_RATES: CommonAwardRates = {
  security: {
    name: "Security Services Industry Award (MA000016)",
    levels: [
      { label: "Level 1 — Security Officer", rate: 24.73 },
      { label: "Level 2 — Security Officer (advanced)", rate: 25.83 },
      { label: "Level 3 — Security Supervisor", rate: 27.46 },
    ],
  },
  healthcare: {
    name: "Nurses Award (MA000034) / Health Professionals Award (MA000027)",
    levels: [
      { label: "Base rate", rate: 32.04 },
    ],
  },
  aged_care: {
    name: "Aged Care Award (MA000018)",
    levels: [
      { label: "Base rate — Care Worker Level 1", rate: 28.17 },
    ],
  },
  ndis_schads: {
    name: "SCHADS Award (MA000100) — NDIS/Disability",
    levels: [
      { label: "Base rate — Level 1", rate: 31.49 },
    ],
  },
  retail: {
    name: "General Retail Industry Award (MA000004)",
    levels: [
      { label: "Level 1 — Retail Employee", rate: 23.23 },
    ],
  },
  hospitality: {
    name: "Hospitality Industry (General) Award (MA000009)",
    levels: [
      { label: "Level 1 — Hospitality Employee", rate: 24.01 },
    ],
  },
};
