export function shortenAddress(
    address: string | null | undefined,
    n = 3,
  ): string {
    return address
      ? `${address?.slice(0, n + 2)}...${address?.slice(-n - 1)}`
      : "";
  }
  
  export function colorToString(color: number) {
    return `#${color.toString(16).padStart(6, "0")}`;
  }
  
  export function stringToColor(color: string) {
    return Number.parseInt(color.replace("#", "0x"));
  }

  /**
 * Platform detection utilities
 */

/**
 * Checks if the app is running on a desktop environment (not on Capacitor)
 */
export const isDesktop = (): boolean => {
  // Check if we're running in a Capacitor environment
  const isCapacitor = typeof window !== 'undefined' && 
    (window as any).Capacitor !== undefined;
  
  // If we're not in Capacitor, we're on desktop
  return !isCapacitor;
};

/**
 * Checks if the app is running on a mobile device (on Capacitor)
 */
export const isMobile = (): boolean => {
  return !isDesktop();
};

/**
 * Checks if the app is running on iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Checks if the app is running on Android
 */
export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}; 

export function generateId(timestamp: string, logIndex: number): string {
  return `${timestamp}-${logIndex}`;
}