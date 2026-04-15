export interface InitialAuth {
  isAuthenticated: boolean;
  plan: string | null;
  credits: number | null;
  monthlyCredits: number;
  maxInputLength: number;
  allowSonnet: boolean;
  resetAt: string | null;
  referralCode: string;
}
