import AsyncStorage from "@react-native-async-storage/async-storage";

const CLE_PROGRAMMES = "programmes_benoit";
const CLE_REGLAGES = "reglages_benoit";

export async function lireProgrammes(): Promise<string | null> {
  return AsyncStorage.getItem(CLE_PROGRAMMES);
}

export async function sauvegarderProgrammes(json: string): Promise<void> {
  return AsyncStorage.setItem(CLE_PROGRAMMES, json);
}

export async function lireReglages(): Promise<string | null> {
  return AsyncStorage.getItem(CLE_REGLAGES);
}

export async function sauvegarderReglages(json: string): Promise<void> {
  return AsyncStorage.setItem(CLE_REGLAGES, json);
}
