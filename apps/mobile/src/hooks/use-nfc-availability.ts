import { useCallback, useEffect, useRef, useState } from "react";

import { isNfcSupported } from "@/lib/nfc/nfc-service";

export function useNfcAvailability() {
  const isMountedRef = useRef(true);
  const [isCheckingNfc, setIsCheckingNfc] = useState(true);
  const [isNfcAvailable, setIsNfcAvailable] = useState(false);

  const refreshNfcAvailability = useCallback(async () => {
    setIsCheckingNfc(true);
    try {
      const supported = await isNfcSupported();
      if (isMountedRef.current) {
        setIsNfcAvailable(supported);
      }
    } catch {
      if (isMountedRef.current) {
        setIsNfcAvailable(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCheckingNfc(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void refreshNfcAvailability();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshNfcAvailability]);

  return {
    isCheckingNfc,
    isNfcAvailable,
    refreshNfcAvailability,
  };
}
