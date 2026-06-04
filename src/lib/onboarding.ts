const ONBOARDING_COMPLETE_KEY = "rr:onboarding-complete-v1";

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingComplete(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "1");
  } catch {
    // Ignore storage write failures (private mode / blocked storage).
  }
}
