/**
 * Trigger mobile device haptic vibration patterns
 */
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'badge' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'success':
        // Double tap buzz
        navigator.vibrate([25, 40, 35]);
        break;
      case 'badge':
        // Fanfare burst pattern
        navigator.vibrate([40, 30, 40, 30, 80]);
        break;
      case 'error':
        navigator.vibrate([60, 40, 60]);
        break;
    }
  } catch {
    // Graceful fallback on devices that don't support vibrate
  }
}
