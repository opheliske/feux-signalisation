import AsyncStorage from "@react-native-async-storage/async-storage";

// NOTE: the storage key strings are kept as-is to preserve data already
// persisted on existing installs (renaming them would wipe stored values).
const KEY_PROGRAMS = "programmes_benoit";
const KEY_SETTINGS = "reglages_benoit";

export async function readPrograms(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PROGRAMS);
}

export async function savePrograms(json: string): Promise<void> {
  return AsyncStorage.setItem(KEY_PROGRAMS, json);
}

export async function readSettings(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_SETTINGS);
}

export async function saveSettings(json: string): Promise<void> {
  return AsyncStorage.setItem(KEY_SETTINGS, json);
}
