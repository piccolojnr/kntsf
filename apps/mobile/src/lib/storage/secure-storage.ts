import * as SecureStore from "expo-secure-store";

import { STORAGE_KEYS } from "@/constants/config";

export async function getStoredToken() {
  return SecureStore.getItemAsync(STORAGE_KEYS.authToken);
}

export async function setStoredToken(token: string) {
  return SecureStore.setItemAsync(STORAGE_KEYS.authToken, token);
}

export async function removeStoredToken() {
  return SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
}
