import Constants from "expo-constants";
import { Platform } from "react-native";

let managerStarted = false;

type NfcModule = typeof import("react-native-nfc-manager");

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
  const nfcModule = await loadNfcModule();

  if (!nfcModule) {
    throw new Error("NFC is not available on this device");
  }

  const supported = await isNfcSupported();

  if (!supported) {
    throw new Error("NFC is not available on this device");
  }

  try {
    await nfcModule.default.requestTechnology([
      nfcModule.NfcTech.NfcA,
      nfcModule.NfcTech.MifareClassic,
      nfcModule.NfcTech.MifareUltralight,
    ]);

    const tag = await nfcModule.default.getTag();
    const uid = tag?.id?.trim();

    if (!uid) {
      return null;
    }

    return uid;
  } catch (error) {
    if (isCancellationError(error, nfcModule)) {
      return null;
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("NFC tag reading failed.");
  } finally {
    try {
      await nfcModule.default.cancelTechnologyRequest({
        throwOnError: false,
      });
    } catch {
      // Ignore cancellation cleanup failures.
    }
  }
}
