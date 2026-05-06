export async function isNfcSupported(): Promise<boolean> {
  return false;
}

export async function readCardUid(): Promise<string | null> {
  throw new Error("NFC card reading is not implemented yet.");
}
