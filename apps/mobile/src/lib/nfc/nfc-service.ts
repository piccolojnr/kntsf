import { Platform } from "react-native";
import NfcManager, {
  NfcError,
  NfcTech,
} from "react-native-nfc-manager";

let managerStarted = false;

async function ensureNfcStarted() {
  if (managerStarted) {
    return true;
  }

  await NfcManager.start();
  managerStarted = true;
  return true;
}

function isCancellationError(error: unknown) {
  if (
    error instanceof NfcError.UserCancel ||
    error instanceof NfcError.SessionInvalidated
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
    await ensureNfcStarted();

    const supported = await NfcManager.isSupported();

    if (!supported) {
      return false;
    }

    return await NfcManager.isEnabled();
  } catch {
    return false;
  }
}

export async function readCardUid(): Promise<string | null> {
  const supported = await isNfcSupported();

  if (!supported) {
    throw new Error("NFC is not available on this device");
  }

  try {
    await NfcManager.requestTechnology([
      NfcTech.NfcA,
      NfcTech.MifareClassic,
      NfcTech.MifareUltralight,
    ]);

    const tag = await NfcManager.getTag();
    const uid = tag?.id?.trim();

    if (!uid) {
      return null;
    }

    return uid;
  } catch (error) {
    if (isCancellationError(error)) {
      return null;
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("NFC tag reading failed.");
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest({
        throwOnError: false,
      });
    } catch {
      // Ignore cancellation cleanup failures.
    }
  }
}
