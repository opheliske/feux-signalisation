import { DeclencheurPlanifie, Programme } from "../theme";

// expo-notifications fonctionne pour les notifications locales dans Expo Go.
// Les tâches en arrière-plan (expo-task-manager) nécessitent un build natif.

const JOURS_WEEKDAY: Record<DeclencheurPlanifie["jours"][number], number> = {
  dim: 1,
  lun: 2,
  mar: 3,
  mer: 4,
  jeu: 5,
  ven: 6,
  sam: 7,
};

export async function demanderPermissions(): Promise<boolean> {
  try {
    const Notifications = await import("expo-notifications");
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

export async function planifierDeclencheur(
  declencheur: DeclencheurPlanifie,
  programme: Programme
): Promise<void> {
  await annulerDeclencheur(declencheur.id);
  if (!declencheur.actif || declencheur.jours.length === 0) return;

  const [hStr, mStr] = declencheur.heure.split(":");
  const heure = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);

  try {
    const Notifications = await import("expo-notifications");
    for (const jour of declencheur.jours) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${declencheur.id}-${jour}`,
        content: {
          title: "Mes Feux",
          body: `C'est l'heure de lancer « ${programme.nom} »`,
          data: { programmeId: programme.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: JOURS_WEEKDAY[jour],
          hour: heure,
          minute: minute,
        },
      });
    }
  } catch (e) {
    console.warn("[planificateur]", e);
  }
}

export async function annulerDeclencheur(id: string): Promise<void> {
  try {
    const Notifications = await import("expo-notifications");
    const jours = Object.keys(JOURS_WEEKDAY) as DeclencheurPlanifie["jours"];
    for (const jour of jours) {
      await Notifications.cancelScheduledNotificationAsync(`${id}-${jour}`).catch(
        () => {}
      );
    }
  } catch {}
}

export function configurerRecepteurNotifications(
  onLancer: (programmeId: string) => void
): (() => void) | null {
  try {
    // Dynamic import pour ne pas crasher si expo-notifications n'est pas dispo
    import("expo-notifications").then((Notifications) => {
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          programmeId?: string;
        };
        if (data.programmeId) onLancer(data.programmeId);
      });
    });
    return null;
  } catch {
    return null;
  }
}
