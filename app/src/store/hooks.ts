import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";
import { useState, useEffect } from "react";
import { isAndroid, isDesktop, isIOS, isMobile } from "./platform";

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook to detect the current platform
 * @returns Object with platform detection methods
 */
export const usePlatform = () => {
  const [platform, setPlatform] = useState({
    isDesktop: isDesktop(),
    isMobile: isMobile(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
  });

  useEffect(() => {
    // Update platform info on mount
    setPlatform({
      isDesktop: isDesktop(),
      isMobile: isMobile(),
      isIOS: isIOS(),
      isAndroid: isAndroid(),
    });
  }, []);

  return platform;
};
