import Constants from "expo-constants";
import { Platform } from "react-native";

let managerStarted = false;
let activeReadPromise: Promise<string | null> | null = null;

type NfcModule = typeof import("react-native-nfc-manager");

const SCAN_TIMEOUT_MS = 10_000;
const NFC_ERROR_MESSAGES = {
  unsupported: "NFC not supported",
  disabled: "NFC disabled",
  cancelled: "Scan cancelled",
  noCard: "No card detected",
  unknown: "Unknown error",
} as const;

async function loadNfcModule(): Promise<NfcModule | null> {
  if (Constants.appOwnership === "expo") {
    return null;
  }

  try {
    return await import("react-native-nfc-manager");
  } catch {
    return null;
  }
}

async function ensureNfcStarted(nfcModule: NfcModule) {
  if (managerStarted) {
    return true;
  }

  await nfcModule.default.start();
  managerStarted = true;
  return true;
}

function isCancellationError(error: unknown, nfcModule: NfcModule) {
  if (
    error instanceof nfcModule.NfcError.UserCancel ||
    error instanceof nfcModule.NfcError.SessionInvalidated
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();

  return (
    normalizedMessage.includes("cancel") ||
    normalizedMessage.includes("cancelled") ||
    normalizedMessage.includes("canceled")
  );
}

function normalizeUid(uid: string) {
  return uid.replace(/\s+/g, "").toUpperCase();
}

function logNfc(message: string, details?: unknown) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[NFC] ${message}`, details);
    return;
  }

  console.log(`[NFC] ${message}`);
}

async function getNfcModuleOrThrow() {
  if (Platform.OS !== "android") {
    throw new Error(NFC_ERROR_MESSAGES.unsupported);
  }

  const nfcModule = await loadNfcModule();

  if (!nfcModule) {
    throw new Error(NFC_ERROR_MESSAGES.unsupported);
  }

  return nfcModule;
}

async function assertNfcReady(nfcModule: NfcModule) {
  await ensureNfcStarted(nfcModule);

  const supported = await nfcModule.default.isSupported();

  if (!supported) {
    throw new Error(NFC_ERROR_MESSAGES.unsupported);
  }

  const enabled = await nfcModule.default.isEnabled();

  if (!enabled) {
    throw new Error(NFC_ERROR_MESSAGES.disabled);
  }
}

async function cancelNfcRequest(nfcModule: NfcModule) {
  try {
    await nfcModule.default.cancelTechnologyRequest({
      throwOnError: false,
    });
  } catch {
    // Ignore cancellation cleanup failures.
  }
}

async function readCardUidInternal(): Promise<string | null> {
  const nfcModule = await getNfcModuleOrThrow();

  await assertNfcReady(nfcModule);
  logNfc("scan start");

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    const readPromise = (async () => {
      await nfcModule.default.requestTechnology([
        nfcModule.NfcTech.NfcA,
        nfcModule.NfcTech.MifareClassic,
        nfcModule.NfcTech.MifareUltralight,
      ]);

      const tag = await nfcModule.default.getTag();
      const uid = tag?.id ? normalizeUid(tag.id) : "";

      if (!uid) {
        return null;
      }

      logNfc("UID read", uid);
      return uid;
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        void cancelNfcRequest(nfcModule);
        reject(new Error(NFC_ERROR_MESSAGES.noCard));
      }, SCAN_TIMEOUT_MS);
    });

    return await Promise.race([readPromise, timeoutPromise]);
  } catch (error) {
    if (isCancellationError(error, nfcModule)) {
      logNfc("scan failure", NFC_ERROR_MESSAGES.cancelled);
      throw new Error(NFC_ERROR_MESSAGES.cancelled);
    }

    if (
      error instanceof Error &&
      Object.values(NFC_ERROR_MESSAGES).includes(
        error.message as (typeof NFC_ERROR_MESSAGES)[keyof typeof NFC_ERROR_MESSAGES],
      )
    ) {
      logNfc("scan failure", error.message);
      throw error;
    }

    logNfc("scan failure", error);
    throw new Error(NFC_ERROR_MESSAGES.unknown);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    await cancelNfcRequest(nfcModule);
  }
}

export async function isNfcSupported(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return false;
  }

  try {
    const nfcModule = await loadNfcModule();

    if (!nfcModule) {
      return false;
    }

    await ensureNfcStarted(nfcModule);

    const supported = await nfcModule.default.isSupported();

    if (!supported) {
      return false;
    }

    return await nfcModule.default.isEnabled();
  } catch {
    return false;
  }
}

export async function readCardUid(): Promise<string | null> {
  if (activeReadPromise) {
    return activeReadPromise;
  }

  activeReadPromise = readCardUidInternal().finally(() => {
    activeReadPromise = null;
  });

  return activeReadPromise;
}
