# Mes Feux

Application mobile pour Benoit — pilote un feu de signalisation physique (lampes verte, orange, rouge) depuis son téléphone.

## Lancer l'application

```bash
npm install
npx expo start
```

Scanne le QR code avec l'app **Expo Go** (iOS ou Android).

## Mode simulation vs Wi-Fi

Par défaut, l'app fonctionne en **mode simulation** : les commandes sont affichées dans la console, aucun matériel requis.

Pour piloter un vrai feu via Wi-Fi, crée un fichier `.env` à la racine :

```
EXPO_PUBLIC_FEU_MODE=wifi
```

Puis renseigne l'adresse IP du feu dans l'écran **Réglages** de l'application.

## Format HTTP attendu par l'ESP32

| Action | Méthode | URL | Corps |
|---|---|---|---|
| Changer la lampe | `POST` | `http://<IP>/lampe` | `{ "lampe": "vert" }` |
| Allumer le feu | `POST` | `http://<IP>/allumer` | _(vide)_ |
| Éteindre le feu | `POST` | `http://<IP>/eteindre` | _(vide)_ |

Valeurs possibles pour `lampe` : `"vert"`, `"orange"`, `"rouge"`, `"eteint"`.

## Lancer les tests

```bash
npm test
```

Les tests couvrent le moteur de lecture (`services/moteurLecture.ts`) : avancement d'étape, bouclage, pause, reprise, arrêt.
