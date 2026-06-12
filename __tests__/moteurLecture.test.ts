import {
  lancerProgramme,
  pauseMoteur,
  reprendreMoteur,
  arreterMoteur,
  estEnPause,
  estActif,
} from "../services/moteurLecture";
import { Programme, Lampe } from "../theme";

// Le moteur est un moteur d'affichage : il ne parle plus au feu (le matériel
// exécute lui-même la séquence) et notifie l'écran UNIQUEMENT au changement
// d'étape (pas de progression). On vérifie le minutage, la boucle et la pause.

function creerProgramme(
  etapes: Array<{ lampe?: Lampe; lampes?: Lampe[]; duree: number }>
): Programme {
  return {
    id: "test",
    nom: "Test",
    epingle: false,
    nbLancements: 0,
    etapes: etapes.map((e, i) => ({
      id: `e${i}`,
      lampes: e.lampes ?? (e.lampe ? [e.lampe] : ["eteint"]),
      dureeSecondes: e.duree,
    })),
    creeA: 0,
    modifieA: 0,
  };
}

describe("moteurLecture", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    arreterMoteur();
  });

  afterEach(() => {
    arreterMoteur();
    jest.useRealTimers();
  });

  test("démarre à l'étape 0 et notifie l'aperçu", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 2 }]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    expect(onTick).toHaveBeenCalledWith(0);
    expect(estActif()).toBe(true);
  });

  test("ne notifie pas tant que l'étape ne change pas", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 5 }]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    onTick.mockClear();
    jest.advanceTimersByTime(2000); // toujours dans l'étape 0
    expect(onTick).not.toHaveBeenCalled();
  });

  test("passe à l'étape suivante quand la durée est atteinte", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "rouge", duree: 1 },
    ]);
    const indices: number[] = [];
    lancerProgramme(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(1100);

    expect(indices).toContain(1);
  });

  test("boucle : revient à l'étape 0 après la dernière étape", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "orange", duree: 1 },
    ]);
    const indices: number[] = [];
    lancerProgramme(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(2500);

    const passages0 = indices.filter((i) => i === 0);
    expect(passages0.length).toBeGreaterThan(1);
  });

  test("pause gèle l'avancement des étapes", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "rouge", duree: 1 },
    ]);
    const indices: number[] = [];
    lancerProgramme(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(500); // milieu de l'étape 0
    pauseMoteur();
    expect(estEnPause()).toBe(true);

    jest.advanceTimersByTime(3000); // aurait dû changer d'étape sans la pause
    expect(indices).not.toContain(1);
  });

  test("reprendre après pause continue l'avancement", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "rouge", duree: 1 },
    ]);
    const indices: number[] = [];
    lancerProgramme(prog, (i) => indices.push(i), jest.fn());

    jest.advanceTimersByTime(500);
    pauseMoteur();
    jest.advanceTimersByTime(2000);
    expect(indices).not.toContain(1);

    reprendreMoteur();
    jest.advanceTimersByTime(600); // 500ms déjà écoulées → franchit la seconde
    expect(indices).toContain(1);
  });

  test("arrêt : désactive le moteur et remet estActif à false", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 5 }]);
    lancerProgramme(prog, jest.fn(), jest.fn());

    jest.advanceTimersByTime(500);
    arreterMoteur();

    expect(estActif()).toBe(false);
    expect(estEnPause()).toBe(false);
  });

  test("arrêt : le timer ne continue pas après arrêt", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "rouge", duree: 1 },
    ]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    arreterMoteur();
    const nbAppelsAvant = onTick.mock.calls.length;
    jest.advanceTimersByTime(3000);

    expect(onTick.mock.calls.length).toBe(nbAppelsAvant);
  });

  test("programme sans étape ne démarre pas", () => {
    const prog = creerProgramme([]);
    lancerProgramme(prog, jest.fn(), jest.fn());

    expect(estActif()).toBe(false);
  });
});
