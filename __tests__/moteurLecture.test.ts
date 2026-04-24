import {
  lancerProgramme,
  pauseMoteur,
  reprendreMoteur,
  arreterMoteur,
  estEnPause,
  estActif,
} from "../services/moteurLecture";
import { Programme, Lampe } from "../theme";

jest.mock("../services/feu", () => ({
  envoyerCommandeAuFeu: jest.fn().mockResolvedValue(undefined),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { envoyerCommandeAuFeu } = require("../services/feu") as {
  envoyerCommandeAuFeu: jest.Mock;
};

function creerProgramme(
  etapes: Array<{ lampe: Lampe; duree: number }>
): Programme {
  return {
    id: "test",
    nom: "Test",
    epingle: false,
    nbLancements: 0,
    etapes: etapes.map((e, i) => ({
      id: `e${i}`,
      lampe: e.lampe,
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
    envoyerCommandeAuFeu.mockClear();
  });

  afterEach(() => {
    arreterMoteur();
    jest.useRealTimers();
  });

  test("démarre à l'étape 0 et envoie la commande au feu", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 2 }]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    expect(envoyerCommandeAuFeu).toHaveBeenCalledWith("vert");
    expect(onTick).toHaveBeenCalledWith(0, 0);
    expect(estActif()).toBe(true);
  });

  test("avance la progression dans une étape", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 2 }]);
    const ticks: Array<[number, number]> = [];
    lancerProgramme(prog, (i, p) => ticks.push([i, p]), jest.fn());

    jest.advanceTimersByTime(1000);

    const dernier = ticks[ticks.length - 1];
    expect(dernier[0]).toBe(0);
    expect(dernier[1]).toBeGreaterThan(0);
    expect(dernier[1]).toBeLessThan(1);
  });

  test("passe à l'étape suivante quand la durée est atteinte", () => {
    const prog = creerProgramme([
      { lampe: "vert", duree: 1 },
      { lampe: "rouge", duree: 1 },
    ]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    jest.advanceTimersByTime(1100);

    const indices = (onTick.mock.calls as Array<[number, number]>).map(
      ([i]) => i
    );
    expect(indices).toContain(1);
    expect(envoyerCommandeAuFeu).toHaveBeenCalledWith("rouge");
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

  test("pause gèle la progression", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 5 }]);
    const progressions: number[] = [];
    lancerProgramme(prog, (_, p) => progressions.push(p), jest.fn());

    jest.advanceTimersByTime(500);
    pauseMoteur();
    expect(estEnPause()).toBe(true);

    const snapshot = progressions[progressions.length - 1];
    jest.advanceTimersByTime(2000);

    expect(progressions[progressions.length - 1]).toBe(snapshot);
  });

  test("reprendre après pause continue l'avancement", () => {
    const prog = creerProgramme([{ lampe: "vert", duree: 5 }]);
    const progressions: number[] = [];
    lancerProgramme(prog, (_, p) => progressions.push(p), jest.fn());

    jest.advanceTimersByTime(500);
    pauseMoteur();
    const avant = progressions[progressions.length - 1];

    jest.advanceTimersByTime(1000);
    reprendreMoteur();
    jest.advanceTimersByTime(500);

    expect(progressions[progressions.length - 1]).toBeGreaterThan(avant);
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
    const prog = creerProgramme([{ lampe: "vert", duree: 1 }]);
    const onTick = jest.fn();
    lancerProgramme(prog, onTick, jest.fn());

    jest.advanceTimersByTime(200);
    const nbAppelsAvant = onTick.mock.calls.length;
    arreterMoteur();
    jest.advanceTimersByTime(500);

    expect(onTick.mock.calls.length).toBe(nbAppelsAvant);
  });

  test("programme sans étape ne démarre pas", () => {
    const prog = creerProgramme([]);
    lancerProgramme(prog, jest.fn(), jest.fn());

    expect(estActif()).toBe(false);
    expect(envoyerCommandeAuFeu).not.toHaveBeenCalled();
  });
});
