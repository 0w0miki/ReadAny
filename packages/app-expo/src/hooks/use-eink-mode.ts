/**
 * E-ink (electronic paper) mode selectors.
 *
 * The mobile build targets e-ink devices first, so the mode defaults to on and
 * can be toggled in Settings → 通用. It reduces motion and surfaces controls
 * that are easy to hit on screens with slow refresh.
 */
import { useSettingsStore } from "@/stores/settings-store";

export function useEinkMode(): boolean {
  return useSettingsStore((s) => s.einkMode);
}

/**
 * Animation type for a `Modal`: instant in e-ink mode, otherwise the caller's
 * preferred transition.
 */
export function useModalAnimationType<T extends "slide" | "fade">(type: T): T | "none" {
  const einkMode = useEinkMode();
  return einkMode ? "none" : type;
}
