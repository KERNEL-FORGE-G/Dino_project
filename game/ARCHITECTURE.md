# Architecture du jeu Dyno — Guide Étudiant

Ce guide explique comment le jeu est structuré pour qu'un groupe d'étudiants
puisse le comprendre, le reproduire ou le modifier.

---

## Vue d'ensemble

Dyno est un jeu de type "runner" (comme le dinosaure de Chrome).
Le personnage court automatiquement, le joueur doit sauter ou s'accroupir
pour éviter les obstacles.

**Technologie** : TypeScript + Canvas HTML5 (API 2D native du navigateur).

---

## Organisation des fichiers

```
src/game/
│
├── constants.ts      ← Toutes les constantes (vitesse, gravité, scores...)
├── types.ts          ← Toutes les interfaces TypeScript partagées
├── SpriteLoader.ts   ← Outil de chargement d'images (cache centralisé)
│
├── AvatarManager.ts  ← Définition des 12 personnages jouables
├── ZoneManager.ts    ← Les 3 zones (Blanche, Verte, Orange)
├── WeatherSystem.ts  ← Météo réelle (API open-meteo) + effets visuels
├── AudioSystem.ts    ← Sons du jeu (saut, collision)
├── ScoreDisplay.ts   ← Affichage score et cœurs via sprites
│
├── Background.ts     ← Décor défilant en parallaxe (3 couches)
├── Ground.ts         ← Sol texturé défilant
│
├── Dino.ts           ← JOUEUR : physique, contrôles, animations
├── Enemy.ts          ← Ennemis au sol (coccinelle, souris, zombie, barnacle,
│                        blue, green, tr, tu, ty, voitures, props...)
├── Bird.ts           ← Ennemis aériens (mouche, abeille, chauve-souris, OVNI)
├── FallingEnemy.ts   ← Bloc tombant du ciel
│
└── Game.ts           ← CHEF D'ORCHESTRE : relie tout ensemble
```

---

## La boucle de jeu (Game.ts)

Le cœur du jeu est la fonction `gameLoop()` qui s'exécute ~60 fois par seconde
grâce à `requestAnimationFrame`. Chaque "tick" suit toujours le même ordre :

```
1. Mettre à jour le score
   └─ Vérifier si on change de zone
2. Générer un obstacle (si le timer est écoulé)
3. Déplacer tous les obstacles vers la gauche
   └─ Supprimer ceux qui sont sortis de l'écran
4. Détecter les collisions joueur ↔ obstacles
   ├─ Plateforme : poser le joueur dessus
   └─ Ennemi     : enlever 1 point de vie
5. Appliquer la physique du joueur (gravité, sol)
6. Faire défiler le décor
7. DESSINER tout sur le canvas
   ├─ Fond (décor)
   ├─ Sol
   ├─ Joueur
   ├─ Obstacles
   ├─ Interface (score + cœurs)
   └─ Effets météo
```

---

## Les systèmes principaux

### 1. Système de sprites

Un sprite est une image dessinée sur le canvas.
Les images se chargent de façon **asynchrone** (l'image se télécharge en arrière-plan).

```
SpriteLoader.load("chemin/vers/image.png")
   → retourne une Promise<HTMLImageElement>
   → met l'image en cache pour ne pas la recharger
```

Pour animer un personnage, on alterne entre plusieurs sprites.
Exemple pour la marche :
```
frame 0 → walk_a.png
frame 1 → walk_b.png
frame 0 → walk_a.png  (on boucle)
```

### 2. Système de zones

3 zones débloquées progressivement par le score :

| Zone    | Couleur | Score requis | Ennemis disponibles         |
|---------|---------|--------------|------------------------------|
| 1       | Blanche | 0            | Coccinelle, Souris           |
| 2       | Verte   | 100          | + Zombie, Blocs tombants     |
| 3       | Orange  | 300          | + Voitures, Camions          |

Chaque zone a son propre décor (head + body + foot) et ses propres plateformes.

### 3. Système de parallaxe (décor)

Le décor est divisé en **3 couches** qui défilent à des vitesses différentes.
Cela crée une impression de profondeur (les objets lointains bougent moins vite).

```
Couche head (ciel/horizon)  → vitesse × 0.5  (lente)
Couche body (milieu)        → vitesse × 0.5  (lente)
Couche foot (premier plan)  → vitesse × 0.7  (plus rapide)
Sol                         → vitesse × 1.0  (vitesse du jeu)
```

### 4. Système de physique

La gravité est simple : chaque frame, `velocityY += GRAVITY`.
Le personnage tombe naturellement. Pour sauter, on lui donne une impulsion
négative : `velocityY = JUMP_FORCE` (négatif = vers le haut).

```
Axe Y du canvas :
  0 ─────────────── haut
       ↓ gravity
 400 ─────────────── bas (sol)
```

### 5. Détection de collision

On utilise des **AABB** (Axis-Aligned Bounding Boxes) — des rectangles simples.
Deux rectangles se chevauchent si :

```
  A.gauche < B.droite  ET
  A.droite > B.gauche  ET
  A.haut   < B.bas     ET
  A.bas    > B.haut
```

On ajoute une "marge" de quelques pixels pour être indulgent avec le joueur.

### 6. Système météo

Au démarrage, le jeu tente de récupérer votre position GPS puis
appelle l'API `open-meteo.com` pour obtenir la météo réelle.

```
Code WMO 0   → Ensoleillé  (aucun effet)
Code WMO 45  → Brouillard  (voile gris semi-transparent)
Code WMO 61  → Pluie       (particules bleues qui tombent)
Code WMO 71  → Neige       (particules blanches lentes)
Code WMO 95  → Orage       (éclairs aléatoires + pluie forte)
```

---

## Comment reproduire ce jeu from scratch

**Étape 1 — Environnement**
- Créer un projet Vite + TypeScript
- Ajouter un `<canvas>` dans l'HTML

**Étape 2 — Boucle minimale**
```typescript
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // dessiner ici
  requestAnimationFrame(gameLoop);
}
gameLoop();
```

**Étape 3 — Joueur avec gravité**
```typescript
let y = 200, vy = 0;
const GRAVITY = 0.8, GROUND = 350;

function update() {
  vy += GRAVITY;
  y  += vy;
  if (y > GROUND) { y = GROUND; vy = 0; }
}
```

**Étape 4 — Obstacles**
- Créer des rectangles qui partent de la droite et se déplacent à gauche
- Les supprimer quand ils sortent de l'écran

**Étape 5 — Collision**
- AABB entre le joueur et chaque obstacle

**Étape 6 — Sprites**
- Charger des images avec `new Image()` et `img.onload`
- Utiliser `ctx.drawImage(img, x, y, w, h)` à la place des rectangles

**Étape 7 — Décor défilant**
- Répéter une image en boucle horizontalement
- Avancer le décalage X de `speed` px par frame

---

## Assets (ressources graphiques)

```
public/assets/
├── personnages/      → Sprites des personnages jouables
│   ├── Adventurer/   → adventurer_idle.png, adventurer_walk1.png...
│   ├── Default/      → character_beige_idle.png, character_green_idle.png...
│   ├── Female/
│   ├── Soldier/
│   └── robot/        → robot_blueDrive1.png, robot_blueJump.png...
│
├── enemies/
│   ├── sol/          → Ennemis au sol
│   │   ├── ladybug/  → ladybug_idle.png, ladybug_walk_a.png, ladybug_walk_b.png
│   │   ├── souris/   → souris_idle.png, mouse_walk_a.png, mouse_walk_b.png
│   │   ├── Zombie/   → zombie_tilesheet.png
│   │   ├── Cars/     → sedan.png, truck.png, bus.png... (40+ véhicules)
│   │   └── Props/    → barrier.png
│   │
│   ├── airs/         → Ennemis aériens
│   │   ├── mouche/   → fly_a.png, fly_b.png
│   │   ├── bee/      → bee_a.png, bee_b.png
│   │   └── ovnie/    → shipBlue_manned.png... (5 couleurs)
│   │
│   └── soltombe/     → Blocs tombants
│       └── bloc/     → block_idle.png, block_fall.png, block_rest.png
│
├── map/
│   ├── zones/        → Tuiles de fond (white_head.png, green_body.png...)
│   ├── plateformes/  → Segments de plateformes (white_p1.png, green_p2.png...)
│   ├── sol/          → Textures du sol (white_zone.svg, green_zone.svg...)
│   ├── numbers/      → Chiffres sprites (0.png à 9.png)
│   └── lifes/        → Cœurs (life1.png=plein, life2.png=demi, life3.png=vide)
│
└── Sounds/
    ├── sfx_jump.ogg
    └── sfx_hurt.ogg
```
