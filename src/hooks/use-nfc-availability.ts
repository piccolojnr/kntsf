import { useEffect, useState } from "react";

import { isNfcSupported } from "@/lib/nfc/nfc-service";

export function useNfcAvailability() {
  const [isCheckingNfc, setIsCheckingNfc] = useState(true);
  const [isNfcAvailable, setIsNfcAvailable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkNfcSupport() {
      try {
        const supported = await isNfcSupported();

        if (isMounted) {
          setIsNfcAvailable(supported);
        }
      } catch {
        if (isMounted) {
          setIsNfcAvailable(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingNfc(false);
        }
      }
    }

    void checkNfcSupport();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    isCheckingNfc,
    isNfcAvailable,
  };
}
