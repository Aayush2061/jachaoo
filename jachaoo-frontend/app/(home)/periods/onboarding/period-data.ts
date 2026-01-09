export type PeriodFormData = {
  lastPeriodDate: Date | null;
  duration: number | null;
  cycleLength: number | null;
  symptoms: string[];
  appearance: string | null;
  conditions: string[];
  contraceptive: string | null;
  tryingToConceive: string | null;
  mainConcern: string | null;
};

// Simple global object to store period data during onboarding
export const periodData: PeriodFormData = {
  lastPeriodDate: null,
  duration: null,
  cycleLength: null,
  symptoms: [],
  appearance: null,
  conditions: [],
  contraceptive: null,
  tryingToConceive: null,
  mainConcern: null,
};
