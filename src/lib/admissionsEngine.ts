/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApplicationStatus } from '../types';

/** Valid forward transitions in the admissions pipeline */
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  submitted:            ['under_review', 'rejected'],
  under_review:         ['shortlisted', 'rejected'],
  shortlisted:          ['interview_scheduled', 'admitted', 'waitlisted', 'rejected'],
  interview_scheduled:  ['admitted', 'waitlisted', 'rejected'],
  admitted:             ['waitlisted'],   // can move to waitlist if offer declined
  waitlisted:           ['admitted', 'rejected'],
  rejected:             [],
};

/**
 * Returns true if the transition from → to is a valid admissions stage move.
 */
export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Generates a human-readable application reference number.
 * Format: APP-{SCHOOLCODE}-{YEAR}-{5-digit-random}
 */
export function generateRefNumber(schoolCode: string, year?: number): string {
  const y = year ?? new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `APP-${schoolCode.toUpperCase()}-${y}-${random}`;
}

/**
 * Generates a student registration number.
 * Format: {PROGRAMCODE}/{SEQUENCE}/{INTAKE}
 */
export function generateRegNumber(programCode: string, sequence: number, intakeCode: string): string {
  const seq = String(sequence).padStart(4, '0');
  return `${programCode.toUpperCase()}/${seq}/${intakeCode.toUpperCase()}`;
}

/**
 * Returns the next waitlisted application (lowest waitlistRank) from a list.
 */
export function getNextWaitlistApplicant<T extends { waitlistRank?: number; status: ApplicationStatus }>(
  applications: T[]
): T | null {
  const waitlisted = applications
    .filter(a => a.status === 'waitlisted' && a.waitlistRank !== undefined)
    .sort((a, b) => (a.waitlistRank ?? 9999) - (b.waitlistRank ?? 9999));
  return waitlisted[0] ?? null;
}

/**
 * Checks whether a program intake has exceeded capacity.
 */
export function isIntakeAtCapacity(
  programCapacity: number,
  admittedCount: number
): boolean {
  return admittedCount >= programCapacity;
}

/**
 * Computes the admissions funnel conversion rate.
 * Conversion = (admitted / total_submitted) * 100
 */
export function computeConversionRate(submitted: number, admitted: number): number {
  if (submitted === 0) return 0;
  return Math.round((admitted / submitted) * 1000) / 10; // 1 decimal place
}

/**
 * Returns a summary object of application counts grouped by status.
 */
export function buildFunnelStats(
  applications: { status: ApplicationStatus }[]
): Record<ApplicationStatus, number> & { total: number; conversionRate: number } {
  const counts: Record<ApplicationStatus, number> = {
    submitted: 0,
    under_review: 0,
    shortlisted: 0,
    interview_scheduled: 0,
    admitted: 0,
    rejected: 0,
    waitlisted: 0,
  };

  for (const app of applications) {
    counts[app.status] = (counts[app.status] ?? 0) + 1;
  }

  return {
    ...counts,
    total: applications.length,
    conversionRate: computeConversionRate(applications.length, counts.admitted)
  };
}
