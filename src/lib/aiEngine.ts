/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * AI Engine — Rule-based scoring and prediction layer.
 * Designed to work without external ML API keys while producing
 * deterministic, explainable risk scores and recommendations.
 */

export interface DropoutRiskInput {
  attendanceRate: number;       // 0–100
  cgpa: number;                 // 0–4.0 (or 0–100 scale)
  cgpaScale: 4 | 100;
  feeBalance: number;           // outstanding balance in local currency
  totalFees: number;            // total fees for current period
  loginFrequencyScore: number;  // 0–100 (100 = logged in every day)
  assignmentSubmissionRate: number; // 0–100
  weeksEnrolled: number;        // must be >= 4 for scoring
}

export interface FeeDefaultRiskInput {
  totalFees: number;
  amountPaid: number;
  paymentCount: number;         // number of payments made
  daysOverdue: number;          // days since last payment due date
  weeksEnrolled: number;
}

export interface RiskResult {
  score: number;                // 0–100
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  insufficientData: boolean;
}

export interface TimetableSuggestion {
  unitId: string;
  unitName: string;
  issue: 'conflict' | 'underutilized';
  description: string;
  suggestedSlot?: string;
}

export interface AdvisorRecommendation {
  unitId: string;
  unitCode: string;
  unitName: string;
  reason: string;
  priority: 'required' | 'recommended' | 'elective';
}

// ─── Risk scoring ─────────────────────────────────────────────────────────────

export function computeDropoutRisk(input: DropoutRiskInput): RiskResult {
  if (input.weeksEnrolled < 4) {
    return { score: 0, level: 'low', factors: [], insufficientData: true };
  }

  const factors: string[] = [];
  let score = 0;

  // Attendance (weight: 35)
  if (input.attendanceRate < 50) {
    score += 35;
    factors.push(`Attendance critically low (${input.attendanceRate.toFixed(0)}%)`);
  } else if (input.attendanceRate < 65) {
    score += 25;
    factors.push(`Attendance below threshold (${input.attendanceRate.toFixed(0)}%)`);
  } else if (input.attendanceRate < 75) {
    score += 15;
    factors.push(`Attendance borderline (${input.attendanceRate.toFixed(0)}%)`);
  }

  // CGPA (weight: 30)
  const normCgpa = input.cgpaScale === 4 ? (input.cgpa / 4) * 100 : input.cgpa;
  if (normCgpa < 30) {
    score += 30;
    factors.push(`CGPA critically low (${input.cgpa.toFixed(2)})`);
  } else if (normCgpa < 50) {
    score += 20;
    factors.push(`CGPA below passing threshold (${input.cgpa.toFixed(2)})`);
  } else if (normCgpa < 60) {
    score += 10;
    factors.push(`CGPA marginally passing (${input.cgpa.toFixed(2)})`);
  }

  // Fee balance (weight: 20)
  const feeRatio = input.totalFees > 0 ? (input.feeBalance / input.totalFees) : 0;
  if (feeRatio > 0.75) {
    score += 20;
    factors.push(`Outstanding fee balance >75% of total fees`);
  } else if (feeRatio > 0.5) {
    score += 12;
    factors.push(`Outstanding fee balance >50% of total fees`);
  } else if (feeRatio > 0.25) {
    score += 5;
    factors.push(`Outstanding fee balance >25% of total fees`);
  }

  // Engagement: login frequency (weight: 8)
  if (input.loginFrequencyScore < 20) {
    score += 8;
    factors.push(`Very low platform engagement (login score: ${input.loginFrequencyScore})`);
  } else if (input.loginFrequencyScore < 40) {
    score += 4;
    factors.push(`Low platform engagement`);
  }

  // Engagement: assignment submission (weight: 7)
  if (input.assignmentSubmissionRate < 30) {
    score += 7;
    factors.push(`Assignment submission rate critically low (${input.assignmentSubmissionRate.toFixed(0)}%)`);
  } else if (input.assignmentSubmissionRate < 60) {
    score += 3;
    factors.push(`Assignment submission rate below expected (${input.assignmentSubmissionRate.toFixed(0)}%)`);
  }

  score = Math.min(100, score);

  const level: RiskResult['level'] =
    score >= 75 ? 'critical' :
    score >= 55 ? 'high' :
    score >= 35 ? 'medium' : 'low';

  return { score, level, factors, insufficientData: false };
}

export function computeFeeDefaultRisk(input: FeeDefaultRiskInput): RiskResult {
  if (input.weeksEnrolled < 4) {
    return { score: 0, level: 'low', factors: [], insufficientData: true };
  }

  const factors: string[] = [];
  let score = 0;

  // Outstanding balance ratio (weight: 50)
  const ratio = input.totalFees > 0 ? (input.totalFees - input.amountPaid) / input.totalFees : 0;
  if (ratio > 0.8) { score += 50; factors.push('Less than 20% of fees paid'); }
  else if (ratio > 0.6) { score += 35; factors.push('Less than 40% of fees paid'); }
  else if (ratio > 0.4) { score += 20; factors.push('Less than 60% of fees paid'); }
  else if (ratio > 0.2) { score += 10; factors.push('Less than 80% of fees paid'); }

  // Days overdue (weight: 30)
  if (input.daysOverdue > 60) { score += 30; factors.push(`Payment overdue by ${input.daysOverdue} days`); }
  else if (input.daysOverdue > 30) { score += 20; factors.push(`Payment overdue by ${input.daysOverdue} days`); }
  else if (input.daysOverdue > 14) { score += 10; factors.push(`Payment overdue by ${input.daysOverdue} days`); }

  // Payment history (weight: 20)
  if (input.paymentCount === 0) { score += 20; factors.push('No payment history recorded'); }
  else if (input.paymentCount === 1) { score += 8; factors.push('Only one payment recorded'); }

  score = Math.min(100, score);
  const level: RiskResult['level'] =
    score >= 75 ? 'critical' :
    score >= 55 ? 'high' :
    score >= 35 ? 'medium' : 'low';

  return { score, level, factors, insufficientData: false };
}

// ─── Timetable optimization ───────────────────────────────────────────────────

export interface TimetableEntry {
  unitId: string;
  unitName: string;
  staffId: string;
  venue: string;
  day: string;
  timeSlot: string;
  enrolledCount: number;
  venueCapacity: number;
}

export function analyzeTimetable(entries: TimetableEntry[]): TimetableSuggestion[] {
  const suggestions: TimetableSuggestion[] = [];
  const slotMap = new Map<string, TimetableEntry[]>();

  // Group by day+timeSlot+staffId to find conflicts
  for (const e of entries) {
    const key = `${e.staffId}|${e.day}|${e.timeSlot}`;
    if (!slotMap.has(key)) slotMap.set(key, []);
    slotMap.get(key)!.push(e);
  }

  for (const [, group] of slotMap) {
    if (group.length > 1) {
      suggestions.push({
        unitId: group[0].unitId,
        unitName: group.map(g => g.unitName).join(' / '),
        issue: 'conflict',
        description: `Lecturer assigned to ${group.length} units on ${group[0].day} at ${group[0].timeSlot}`,
        suggestedSlot: 'Move one unit to an adjacent free slot'
      });
    }
  }

  // Check underutilization (< 40% capacity)
  for (const e of entries) {
    const utilization = e.venueCapacity > 0 ? e.enrolledCount / e.venueCapacity : 1;
    if (utilization < 0.4 && e.venueCapacity > 20) {
      suggestions.push({
        unitId: e.unitId,
        unitName: e.unitName,
        issue: 'underutilized',
        description: `${e.unitName} uses ${e.venue} at ${(utilization * 100).toFixed(0)}% capacity (${e.enrolledCount}/${e.venueCapacity})`,
        suggestedSlot: 'Consider moving to a smaller venue or merging with parallel group'
      });
    }
  }

  return suggestions;
}

// ─── Study assistant ──────────────────────────────────────────────────────────

const STUDY_ASSISTANT_RESPONSES: { pattern: RegExp; response: string }[] = [
  { pattern: /assignment|homework|due/i, response: 'Check your Assignments tab in the LMS for all pending tasks and due dates. You can submit files directly from that tab.' },
  { pattern: /timetable|schedule|class|when/i, response: 'Your current timetable is available under the Timetable tab in your dashboard. It shows all units, venues, days, and times for this semester.' },
  { pattern: /grade|result|gpa|cgpa|mark/i, response: 'Your grades and GPA are viewable in the Results portal. Each semester\'s breakdown is listed with individual unit grades.' },
  { pattern: /fee|payment|invoice|balance/i, response: 'Check your Finance portal for your full fee statement, outstanding balance, and payment history. You can also initiate a payment from there.' },
  { pattern: /register|unit|course|enroll/i, response: 'Unit registration opens at the start of each semester. Go to the Registration tab and select units from your program curriculum. Contact the Registrar if a unit is unavailable.' },
  { pattern: /attendance|absent|present/i, response: 'Your attendance per unit is tracked automatically when you scan the QR code in class. Check your dashboard for current attendance percentages — you need at least 75% to qualify for exams.' },
  { pattern: /library|book|borrow/i, response: 'Browse and borrow books from the Library portal in your dashboard. You can also access digital resources like eBooks and journals from there.' },
  { pattern: /hostel|accommodation|room|bed/i, response: 'Contact the Hostel Manager for accommodation queries. You can view your room allocation in the Campus Life section if you are a residential student.' },
  { pattern: /transport|bus|route|pickup/i, response: 'Transport routes and schedules are visible in the Campus Life section. Your parent can also track the bus location from their portal.' },
  { pattern: /health|sick|clinic|doctor|medical/i, response: 'Visit the campus clinic for medical assistance. Your medical records are managed by the Health Office. Emergency contacts are available at the clinic 24/7.' },
];

export function getStudyAssistantResponse(query: string): string {
  for (const { pattern, response } of STUDY_ASSISTANT_RESPONSES) {
    if (pattern.test(query)) return response;
  }
  return 'I can help with questions about assignments, timetables, grades, fees, unit registration, attendance, library, and campus services. Could you rephrase your question with one of those topics?';
}

// ─── Academic advisor ─────────────────────────────────────────────────────────

export function generateAdvisorRecommendations(
  programCurriculum: { unitId: string; unitCode: string; unitName: string; unitType: 'Core' | 'Elective'; levelId: string }[],
  completedUnitIds: string[],
  failedUnitIds: string[]
): AdvisorRecommendation[] {
  const recommendations: AdvisorRecommendation[] = [];
  const completedSet = new Set(completedUnitIds);
  const failedSet = new Set(failedUnitIds);

  for (const cu of programCurriculum) {
    if (completedSet.has(cu.unitId)) continue; // already done

    if (failedSet.has(cu.unitId)) {
      recommendations.push({
        unitId: cu.unitId,
        unitCode: cu.unitCode,
        unitName: cu.unitName,
        reason: 'You previously did not pass this unit — retaking it is required to progress.',
        priority: 'required'
      });
    } else if (cu.unitType === 'Core') {
      recommendations.push({
        unitId: cu.unitId,
        unitCode: cu.unitCode,
        unitName: cu.unitName,
        reason: 'Core unit required for your program — must be completed to graduate.',
        priority: 'required'
      });
    } else {
      recommendations.push({
        unitId: cu.unitId,
        unitCode: cu.unitCode,
        unitName: cu.unitName,
        reason: 'Elective unit available in your program — choose based on your career interests.',
        priority: 'elective'
      });
    }
  }

  // Sort: required first, then recommended, then elective
  return recommendations.sort((a, b) => {
    const order = { required: 0, recommended: 1, elective: 2 };
    return order[a.priority] - order[b.priority];
  });
}

// ─── Attendance prediction ────────────────────────────────────────────────────

export interface AttendanceTrendInput {
  unitId: string;
  unitName: string;
  weeklyRates: number[]; // most recent last, e.g. [85, 80, 75, 72]
  threshold: number;     // e.g. 75
}

export interface AttendancePrediction {
  unitId: string;
  unitName: string;
  currentRate: number;
  predictedRate: number;
  willBreachThreshold: boolean;
  trend: 'improving' | 'stable' | 'declining';
}

export function predictAttendanceTrends(inputs: AttendanceTrendInput[]): AttendancePrediction[] {
  return inputs.map(input => {
    const rates = input.weeklyRates;
    const currentRate = rates[rates.length - 1] ?? 100;

    // Simple linear extrapolation over last 4 data points
    let predictedRate = currentRate;
    if (rates.length >= 2) {
      const n = Math.min(rates.length, 4);
      const recent = rates.slice(-n);
      const avgDelta = (recent[recent.length - 1] - recent[0]) / (recent.length - 1);
      predictedRate = Math.max(0, Math.min(100, currentRate + avgDelta * 2));
    }

    const delta = predictedRate - currentRate;
    const trend: AttendancePrediction['trend'] =
      delta > 2 ? 'improving' : delta < -2 ? 'declining' : 'stable';

    return {
      unitId: input.unitId,
      unitName: input.unitName,
      currentRate,
      predictedRate: Math.round(predictedRate * 10) / 10,
      willBreachThreshold: predictedRate < input.threshold,
      trend
    };
  });
}
