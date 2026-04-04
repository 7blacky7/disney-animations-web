/**
 * ScrollTrigger Defaults — re-exported for convenience.
 *
 * Components may import defaults from presets instead of scrolltrigger-config.
 */

import { SCROLL_TRIGGER_DEFAULTS } from "../scrolltrigger-config";

// Re-export for convenience — components may import defaults from presets
export const scrollTriggerDefaults = {
  start: SCROLL_TRIGGER_DEFAULTS.start as string,
  end: SCROLL_TRIGGER_DEFAULTS.end as string,
  toggleActions: SCROLL_TRIGGER_DEFAULTS.toggleActions as string,
};
