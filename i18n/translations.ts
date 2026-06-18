// ─── Translations ──────────────────────────────────────────────────────────
//
// Flat key → string maps. French is the primary language and the fallback.
// Strings may contain {name}-style placeholders, interpolated by translate().
//
// Only UI text lives here. Low-level error messages (network, protocol
// validation) stay in English in the logic modules and are not translated.

export const translations = {
  fr: {
    // Common
    common_ok: "OK",
    common_confirm: "Valider",
    common_edit: "Modifier",
    common_duplicate: "Dupliquer",
    common_delete: "Supprimer",
    common_back: "Retour",

    // Lights
    light_green: "Vert",
    light_orange: "Orange",
    light_red: "Rouge",
    light_off: "Éteint",

    // Connection
    conn_connected: "Feu connecté",
    conn_disconnected: "Feu non trouvé",
    conn_connecting: "Connexion…",

    // Home
    home_hello: "Bonjour",
    home_open_settings_a11y: "Ouvrir les réglages",
    home_current_mode: "Mode actif",
    home_none: "Aucun",
    home_stop_mode_a11y: "Arrêter le mode (éteindre le feu)",
    home_favorites: "Favoris",
    home_recent: "Récents",
    home_all_programs: "Tous les programmes",
    home_refresh_a11y: "Rafraîchir les modes depuis le feu",
    home_retry_load_a11y: "Réessayer de charger les modes du feu",
    home_tap_retry: "Touche pour réessayer.",
    home_loading: "Chargement des modes du feu…",
    home_empty: "Aucun mode sur le feu. Crée-en un ci-dessous.",
    home_create_a11y: "Créer un nouveau programme",
    home_create: "+ Créer un programme",

    // Program card
    card_program_a11y: "Programme {name}. {summary}. Touche pour modifier.",
    card_stop_a11y: "Arrêter {name}",
    card_launch_a11y: "Lancer {name}",
    card_more_options: "Plus d'options",
    summary_no_steps: "Aucune étape",

    // Cycle preview
    cycle_preview_a11y:
      "Aperçu du cycle : {total} secondes au total, puis ça recommence",
    cycle_length: "Durée du cycle : {total}s ",

    // Light picker
    picker_choose_lights_a11y: "Choisir une ou plusieurs lampes",
    picker_lights_hint:
      "Coche une ou plusieurs lampes qui s'allumeront en même temps.",
    picker_checked_suffix: ", cochée",
    picker_confirm_a11y: "Valider la sélection",

    // Duration picker
    duration_a11y: "Durée : {value} secondes",
    duration_decrease_a11y: "Diminuer la durée",
    duration_increase_a11y: "Augmenter la durée",
    duration_enter_a11y: "Saisir la durée en secondes",
    duration_enter_hand_a11y: "Saisir la durée à la main",

    // Settings
    settings_ip_label: "Adresse IP du feu (Wi-Fi)",
    settings_ip_placeholder: "ex : 192.168.1.42",
    settings_ip_a11y: "Adresse IP du feu",
    settings_ip_hint: "L'adresse IP du feu sur ton réseau Wi-Fi.",
    settings_disco_animation: "Animation de la boule disco",
    settings_disco_animation_a11y:
      "Activer ou désactiver l'animation de la boule disco",
    settings_application: "Application",
    settings_firmware: "Firmware",
    settings_language: "Langue",

    // Timer
    timer_autostop_in: "Arrêt programmé dans",
    timer_cancel: "Annuler la minuterie",
    timer_cancel_a11y: "Annuler la minuterie",
    timer_autostop_title: "Arrêt automatique dans…",
    timer_stop_in_a11y: "Arrêt dans {label}",
    timer_other_duration: "Autre durée",
    timer_custom_placeholder: "ex : 45",
    timer_custom_a11y: "Durée personnalisée en minutes",
    timer_confirm_custom_a11y: "Valider la durée personnalisée",

    // Mirror & logo
    mirror_close_a11y: "Fermer le mode plein écran",
    a11y_disco_ball: "Boule disco",

    // Navigation (header titles)
    nav_program: "Programme",
    nav_settings: "Réglages",
    nav_timer: "Minuterie",

    // Program editor
    prog_remove_fav_a11y: "Retirer des favoris",
    prog_add_fav_a11y: "Ajouter aux favoris",
    prog_name_label: "Nom du programme",
    prog_name_placeholder: "Ex : Vert tranquille",
    prog_name_hint:
      "{max} caractères max — le feu identifie un mode par son nom.",
    prog_steps: "Étapes",
    prog_no_steps_add: "Aucune étape. Ajoute-en une !",
    prog_edit_lights_a11y:
      "Modifier les lampes de l'étape {num}, actuellement {lights}",
    prog_edit_duration_a11y:
      "Modifier la durée de l'étape {num}, actuellement {seconds} secondes",
    prog_move_up_a11y: "Monter l'étape {num}",
    prog_move_down_a11y: "Descendre l'étape {num}",
    prog_delete_step_a11y: "Supprimer l'étape {num}",
    prog_add_step_a11y: "Ajouter une étape",
    prog_add_step: "+ Ajouter une étape",
    prog_duplicate_a11y: "Dupliquer le programme",
    prog_delete_a11y: "Supprimer le programme",
    prog_sending: "Envoi…",
    prog_save: "Enregistrer",
    prog_save_a11y: "Enregistrer le programme",
    prog_choose_lights: "Choisir les lampes",
    prog_edit_lights: "Modifier les lampes",
    prog_close_picker_a11y: "Fermer le sélecteur",
    prog_step_duration: "Durée de l'étape",
    prog_confirm_duration_a11y: "Valider la durée",
    prog_close_duration_a11y: "Fermer le sélecteur de durée",
    prog_confirm_delete: "Tu veux vraiment supprimer ce programme ?",
    prog_keep: "Non, garder",
    prog_delete_confirm: "Oui, supprimer",
    prog_max_steps: "Le feu accepte au maximum {max} étapes.",
    prog_save_failed: "Échec de l'enregistrement.",
  },

  en: {
    // Common
    common_ok: "OK",
    common_confirm: "Confirm",
    common_edit: "Edit",
    common_duplicate: "Duplicate",
    common_delete: "Delete",
    common_back: "Back",

    // Lights
    light_green: "Green",
    light_orange: "Orange",
    light_red: "Red",
    light_off: "Off",

    // Connection
    conn_connected: "Light connected",
    conn_disconnected: "Light not found",
    conn_connecting: "Connecting…",

    // Home
    home_hello: "Hello",
    home_open_settings_a11y: "Open settings",
    home_current_mode: "Current mode",
    home_none: "None",
    home_stop_mode_a11y: "Stop the mode (turn off the light)",
    home_favorites: "Favorites",
    home_recent: "Recent",
    home_all_programs: "All programs",
    home_refresh_a11y: "Refresh the modes from the light",
    home_retry_load_a11y: "Retry loading the light's modes",
    home_tap_retry: "Tap to retry.",
    home_loading: "Loading the light's modes…",
    home_empty: "No modes on the light. Create one below.",
    home_create_a11y: "Create a new program",
    home_create: "+ Create a program",

    // Program card
    card_program_a11y: "Program {name}. {summary}. Tap to edit.",
    card_stop_a11y: "Stop {name}",
    card_launch_a11y: "Launch {name}",
    card_more_options: "More options",
    summary_no_steps: "No steps",

    // Cycle preview
    cycle_preview_a11y:
      "Cycle preview: {total} seconds total, then it repeats",
    cycle_length: "Cycle length: {total}s ",

    // Light picker
    picker_choose_lights_a11y: "Choose one or more lights",
    picker_lights_hint:
      "Check one or more lights that will turn on at the same time.",
    picker_checked_suffix: ", checked",
    picker_confirm_a11y: "Confirm the selection",

    // Duration picker
    duration_a11y: "Duration: {value} seconds",
    duration_decrease_a11y: "Decrease the duration",
    duration_increase_a11y: "Increase the duration",
    duration_enter_a11y: "Enter the duration in seconds",
    duration_enter_hand_a11y: "Enter the duration by hand",

    // Settings
    settings_ip_label: "Light IP address (Wi-Fi)",
    settings_ip_placeholder: "e.g. 192.168.1.42",
    settings_ip_a11y: "Light IP address",
    settings_ip_hint: "The light's IP address on your Wi-Fi network.",
    settings_disco_animation: "Disco ball animation",
    settings_disco_animation_a11y:
      "Enable or disable the disco ball animation",
    settings_application: "Application",
    settings_firmware: "Firmware",
    settings_language: "Language",

    // Timer
    timer_autostop_in: "Auto-stop in",
    timer_cancel: "Cancel the timer",
    timer_cancel_a11y: "Cancel the timer",
    timer_autostop_title: "Auto-stop in…",
    timer_stop_in_a11y: "Stop in {label}",
    timer_other_duration: "Other duration",
    timer_custom_placeholder: "e.g. 45",
    timer_custom_a11y: "Custom duration in minutes",
    timer_confirm_custom_a11y: "Confirm the custom duration",

    // Mirror & logo
    mirror_close_a11y: "Close fullscreen mode",
    a11y_disco_ball: "Disco ball",

    // Navigation (header titles)
    nav_program: "Program",
    nav_settings: "Settings",
    nav_timer: "Timer",

    // Program editor
    prog_remove_fav_a11y: "Remove from favorites",
    prog_add_fav_a11y: "Add to favorites",
    prog_name_label: "Program name",
    prog_name_placeholder: "E.g. Calm green",
    prog_name_hint:
      "{max} characters max — the light identifies a mode by its name.",
    prog_steps: "Steps",
    prog_no_steps_add: "No steps. Add one!",
    prog_edit_lights_a11y:
      "Edit the lights of step {num}, currently {lights}",
    prog_edit_duration_a11y:
      "Edit the duration of step {num}, currently {seconds} seconds",
    prog_move_up_a11y: "Move step {num} up",
    prog_move_down_a11y: "Move step {num} down",
    prog_delete_step_a11y: "Delete step {num}",
    prog_add_step_a11y: "Add a step",
    prog_add_step: "+ Add a step",
    prog_duplicate_a11y: "Duplicate the program",
    prog_delete_a11y: "Delete the program",
    prog_sending: "Sending…",
    prog_save: "Save",
    prog_save_a11y: "Save the program",
    prog_choose_lights: "Choose the lights",
    prog_edit_lights: "Edit the lights",
    prog_close_picker_a11y: "Close the picker",
    prog_step_duration: "Step duration",
    prog_confirm_duration_a11y: "Confirm the duration",
    prog_close_duration_a11y: "Close the duration picker",
    prog_confirm_delete: "Do you really want to delete this program?",
    prog_keep: "No, keep",
    prog_delete_confirm: "Yes, delete",
    prog_max_steps: "The light accepts at most {max} steps.",
    prog_save_failed: "Save failed.",
  },
} as const;

export type Lang = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)["fr"];

export type TranslationParams = Record<string, string | number>;

export function translate(
  lang: Lang,
  key: TranslationKey,
  params?: TranslationParams
): string {
  const dict = translations[lang] ?? translations.fr;
  const template: string =
    (dict as Record<TranslationKey, string>)[key] ??
    translations.fr[key] ??
    key;
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = params[k];
    return v === undefined ? `{${k}}` : String(v);
  });
}
