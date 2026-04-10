export type PlanId = "free" | "plus" | "pro" | "max";

interface PlanConfig {
  label: string;
  monthlyCredits: number;
  maxInputLength: number;
  allowSonnet: boolean;
  maxStyleSamples: number;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  free: { label: "Free", monthlyCredits: 10, maxInputLength: 500, allowSonnet: false, maxStyleSamples: 0 },
  plus: { label: "Plus", monthlyCredits: 70, maxInputLength: 800, allowSonnet: false, maxStyleSamples: 50 },
  pro: { label: "Pro", monthlyCredits: 200, maxInputLength: 1200, allowSonnet: true, maxStyleSamples: 999 },
  max: { label: "Max", monthlyCredits: 400, maxInputLength: 1200, allowSonnet: true, maxStyleSamples: 999 },
};

export const CREDIT_COST = 3;

export const ANONYMOUS_MAX_INPUT = 100;
export const ANONYMOUS_TOTAL_USES = 5;

export function getPlanConfig(plan: string): PlanConfig {
  if (plan in PLANS) return PLANS[plan as PlanId];
  return PLANS.free;
}

export function validatePlan(plan: string): PlanId {
  const valid: PlanId[] = ["free", "plus", "pro", "max"];
  return valid.includes(plan as PlanId) ? (plan as PlanId) : "free";
}
