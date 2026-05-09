

import { Dino, GameObject } from './Dino';
import { AvatarManager } from './AvatarManager';
import { Bird } from './Bird';
import { Ground } from './Ground';
import { Background } from './Background';
import { SpriteLoader } from './SpriteLoader';
import { AudioManager, WeatherManager, NumberRenderer } from './Utils';
import { ZoneManager } from './ZoneManager';
import { Enemy, GroundEnemyKind } from './Enemy';
import { FallingEnemy } from './FallingEnemy';
import { SPEED_INCREASE, ZONE_SPEED_BOOST } from './constants';

export class Game {

  
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private dino:       Dino;       // Le joueur
  private ground:     Ground;     // Le sol
  private background: Background; // Le décor défilant

  /** Liste de tous les obstacles actifs à l'écran */
  private obstacles: GameObject[] = [];

  
  private audioManager:   AudioManager;
  private weatherManager: WeatherManager;
  private numberRenderer: NumberRenderer;
  private zoneManager:    ZoneManager;

  
  private health     = 6;       // 6 points = 3 cœurs
  private lifeImages: HTMLImageElement[] = [];

  
  private score     = 0;
  private highScore = 0;

  
// cette zone nous sert à gérer les trucs importants
  private gameSpeed   = 6;
  /** Facteur d'échelle pour adapter la taille des entités à la hauteur du canvas */
  private scaleFactor = 1;

  
  private obstacleTimer    = 0;
  private obstacleInterval = 100;

  
  private isPlaying = false;
  private isPaused  = false;

  
  private animFrameId: number | null = null;

  
  private gameOverElement: HTMLElement | null;
  private pauseMenuElement: HTMLElement | null;
  private startMenuElement: HTMLElement | null;

  

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d')!;

    this.dino       = new Dino();
    this.ground     = new Ground();
    this.background = new Background();
    this.zoneManager    = ZoneManager.getInstance();
    this.audioManager   = new AudioManager();
    this.weatherManager = new WeatherManager();
    this.numberRenderer = new NumberRenderer();

    // Charger les sons en arrière-plan (fire-and-forget : le constructeur ne peut pas être async)
    this.audioManager.loadSounds();

    this.gameOverElement  = document.getElementById('game-over');
    this.pauseMenuElement = document.getElementById('pause-menu');
    this.startMenuElement = document.getElementById('start-menu');

    this.loadLifeImages();
// ici on fait la magie pour que ça bouge
    this.loadHighscore();
    this.setupInputs();

    // Ajuster le canvas à la taille de la fenêtre
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Démarrer la boucle de rendu
    this.gameLoop();
  }

  

  private async loadLifeImages(): Promise<void> {
    for (let i = 1; i <= 3; i++) {
      const img = new Image();
      img.src = `assets/map/lifes/life${i}.png`;
      await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      this.lifeImages.push(img);
    }
  }

  private loadHighscore(): void {
    const saved = localStorage.getItem('dino-highscore');
    if (saved) this.highScore = parseInt(saved);
  }

  private saveHighscore(): void {
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
      localStorage.setItem('dino-highscore', this.highScore.toString());
    }
  }

  

  private setupInputs(): void {
    // ─ Gestion du Menu de Départ ──────────────────────────────────────────
    const startBtn = document.getElementById('start-btn');
    startBtn?.addEventListener('click', () => {
        if (this.startMenuElement) this.startMenuElement.style.display = 'none';
        this.start();
    });

    const avatarItems = document.querySelectorAll('.avatar-item');
    avatarItems.forEach(item => {
        item.addEventListener('click', () => {
            avatarItems.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            const avatarId = item.getAttribute('data-id');
            if (avatarId) {
                AvatarManager.getInstance().selectAvatar(avatarId);
                this.audioManager.playSelect();
                this.dino.reset(); // Recharge le sprite
            }
        });
    });

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
// c'est là qu'on définit les variables de base
        if (!this.isPlaying && (!this.startMenuElement || this.startMenuElement.style.display === 'none')) {
          this.start();
        } else if (this.isPlaying) {
          this.dino.jump();
          this.audioManager.playJump();
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        this.dino.duck(true);
      }
      if (e.code === 'KeyP') this.togglePause();
      if (e.code === 'KeyR') this.start();
      if (e.code === 'KeyM') this.audioManager.toggleMute();
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown') this.dino.duck(false);
    });

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!this.isPlaying) this.start();
      else { this.dino.jump(); this.audioManager.playJump(); }
    });

    // ─ Boutons de la barre de commande ───────────────────────────────────
    document.getElementById('toggle-time')?.addEventListener('click', () => {
      this.weatherManager.toggleTime();
      this.audioManager.playMagic();
    });
    document.getElementById('cycle-weather')?.addEventListener('click', () => {
      this.weatherManager.cycleWeather();
      this.audioManager.playMagic();
    });
    document.getElementById('restart-game')?.addEventListener('click', () => {
      this.start();
    });
    document.getElementById('pause-btn')?.addEventListener('click', () => {
      this.togglePause();
    });

// petit bout de code pour que tout fonctionne bien
    // ─ Boutons du menu de PAUSE ───────────────────────────────────────────
    document.getElementById('pause-resume-btn')?.addEventListener('click', () => {
      this.togglePause(); // ferme la pause
    });
    document.getElementById('pause-restart-btn')?.addEventListener('click', () => {
      this.start();
    });
    document.getElementById('pause-mute-btn')?.addEventListener('click', () => {
      this.audioManager.toggleMute();
      this.updateMuteBtn();
    });
    document.getElementById('pause-menu-btn')?.addEventListener('click', () => {
      // Déclenche l'événement "retour au menu" écouté par GamePage.tsx
      window.dispatchEvent(new CustomEvent('dyno:back-to-menu'));
    });

    // ─ Boutons de l'écran Game Over ───────────────────────────────────────
    document.getElementById('restart-btn-gameover')?.addEventListener('click', () => {
      this.start();
    });
    document.getElementById('menu-btn-gameover')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('dyno:back-to-menu'));
    });

    window.addEventListener('dyno:back-to-menu', () => {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.startMenuElement) this.startMenuElement.style.display = 'flex';
        if (this.gameOverElement) this.gameOverElement.style.display = 'none';
        if (this.pauseMenuElement) this.pauseMenuElement.style.display = 'none';
        
        const controlBar = document.getElementById('control-bar');
        if (controlBar) controlBar.style.display = 'none';

        this.saveHighscore();
    });
  }

  /**
   * Met à jour le libellé du bouton mute dans le menu pause.
   * Appelé à chaque toggle pour refléter l'état courant.
   */
  private updateMuteBtn(): void {
    const btn = document.getElementById('pause-mute-btn');
    if (!btn) return;
    // AudioManager expose isMuted en lecture
    const muted = this.audioManager.isMuted ?? false;
    btn.textContent = muted ? '🔇 Activer le son' : '🔊 Couper le son';
  }

  /**
   * Ajuste le canvas à la taille de la fenêtre.
   * Le scaleFactor adapte toutes les tailles à la hauteur disponible.
// j'espère que cette partie ne va pas bugger
   *
   * Note : plus besoin de groundY (= canvas.height - 64 en ancien code).
   * Dans le repère orthonormé, le sol est toujours à Y=0 (coordonnée monde).
   */
  private resize(): void {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = Math.min(window.innerHeight, 400);
    this.scaleFactor   = this.canvas.height / 400;
    // groundY supprimé : dans le repère orthonormé, le sol = Y monde = 0
  }

  

  private start(): void {
    this.isPlaying = true;
    this.isPaused  = false;
    this.hidePauseMenu();
    this.score     = 0;
    this.health    = 6;
    this.obstacles = [];
    this.obstacleTimer = 0;
    this.gameSpeed = 6 * this.scaleFactor;

    if (this.gameOverElement) this.gameOverElement.style.display = 'none';
    if (this.startMenuElement) this.startMenuElement.style.display = 'none';
    
    const controlBar = document.getElementById('control-bar');
    if (controlBar) controlBar.style.display = 'flex';

    this.dino.reset();
    this.zoneManager.reset();
    this.audioManager.startAmbientCycle(); // Lancer le cycle de musiques d'ambiance
    this.background.updateZone();
    this.weatherManager.fetchWeather();
  }

  private togglePause(): void {
    if (!this.isPlaying) return; // Impossible de pauser si le jeu n'a pas démarré
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
  }

  /** Affiche le menu pause et met à jour les infos (score, zone). */
  private showPauseMenu(): void {
    if (!this.pauseMenuElement) return;

    // Mettre à jour le score et le meilleur score affichés
    const scoreEl = document.getElementById('pause-score');
    const bestEl  = document.getElementById('pause-best');
    const zoneEl  = document.getElementById('pause-zone-label');
    if (scoreEl) scoreEl.textContent = Math.floor(this.score).toString();
    if (bestEl)  bestEl.textContent  = this.highScore.toString();
    if (zoneEl)  zoneEl.textContent  = this.zoneManager.getCurrentZone().name;

    this.updateMuteBtn();
    this.pauseMenuElement.style.display = 'flex';
  }

  /** Cache le menu pause et reprend la partie. */
  private hidePauseMenu(): void {
    if (this.pauseMenuElement) {
      this.pauseMenuElement.style.display = 'none';
    }
  }

  

  /**
   * Génère un obstacle aléatoire en dehors du canvas (à droite).
   *
   * LOGIQUE DE SÉLECTION :
   *  15% → plateforme (sur laquelle on peut sauter)
   *  20% → ennemi aérien (Bird : mouche, abeille ou OVNI)
   *  65% → obstacle au sol (selon la zone active)
   *
   * POSITIONS EN REPÈRE ORTHONORMÉ :
   *  - Sol (y=0)         → tous les ennemis au sol
   *  - Air (y=80×scale)  → ennemis aériens volent au-dessus du sol
   *  - Haut (y = aire de jeu complète) → FallingEnemy commence au sommet
   */
  private spawnObstacle(): void {
    const x = this.canvas.width + 100; // Apparaît hors-écran à droite

    // ─ Plateforme ──────────────────────────────────────────────────────────
    if (Math.random() < 0.15) {
      this.spawnPlatform(x);
      return;
    }

    // ─ Ennemi aérien ──────────────────────────────────────────────────────
    if (Math.random() < 0.20) {
      // Coordonnée monde Y : 80px au-dessus du sol (Y=0 = sol, Y>0 = dans les airs)
      const airWorldY = 80 * this.scaleFactor;
      this.obstacles.push(new Bird(x, airWorldY));
      return;
    }

    // ─ Obstacle au sol ────────────────────────────────────────────────────
    const availableTypes = this.zoneManager.getAvailableObstacles();
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)] ?? 'ladybug';
    this.spawnGroundObstacle(x, type);
  }

  /**
   * Génère un obstacle au sol selon son type.
   *
   * REPÈRE ORTHONORMÉ :
   *  Tous les ennemis au sol ont y=0 (leur bas est à la surface du sol).
   *  Plus besoin de calculer "groundY - hauteur" comme avant.
   *
   *  AVANT (canvas) : y = groundY - 45 * scale  (décalage complexe)
   *  MAINTENANT     : y = 0                      (trivial — le sol est Y=0)
   */
  private spawnGroundObstacle(x: number, type: string): void {

    // ─ Bloc tombant du ciel ───────────────────────────────────────────────
    if (type === 'block') {
      const block = new FallingEnemy(x, this.canvas.height);
      block.width  = 60 * this.scaleFactor;
      block.height = 60 * this.scaleFactor;
      this.obstacles.push(block);
      return;
    }

    // ─ Props : barrière, lampadaire, panneaux de signalisation ───────────
    // Obstacles statiques posés sur le sol (y=0), tailles variables
    const propsMap: Record<string, { file: string; w: number; h: number }> = {
      barrier:     { file: 'barrier.png',    w: 40, h: 40 },
      light:       { file: 'light.png',      w: 24, h: 64 },
      sign_red:    { file: 'sign_red.png',   w: 32, h: 48 },
      sign_blue:   { file: 'sign_blue.png',  w: 32, h: 48 },
      sign_street: { file: 'sign_street.png',w: 32, h: 48 },
    };
    if (type in propsMap) {
      const p   = propsMap[type]!;
      const obs = new Enemy(x, 0, 'cars');
      obs.width  = p.w * this.scaleFactor;
      obs.height = p.h * this.scaleFactor;
      obs.sprites.walk = [type];
      const img = new Image();
      img.src = `assets/enemies/sol/Props/${p.file}`;
      obs.imageCache.set(type, img);
      this.obstacles.push(obs);
      return;
    }

    // ─ Grands véhicules (100 × 64) ───────────────────────────────────────
    // Camions, bus, fourgons longs → hitbox haute
    const bigVehicles = ['truck', 'bus', 'bus_school', 'firetruck',
                         'transport', 'van_large'];
    if (bigVehicles.includes(type)) {
      const car = new Enemy(x, 0, 'cars');
      car.width  = 100 * this.scaleFactor;
      car.height =  64 * this.scaleFactor;
      car.sprites.walk = [type];
      const img = new Image();
      img.src = `assets/enemies/sol/Cars/${type}.png`;
      car.imageCache.set(type, img);
      this.obstacles.push(car);
      return;
    }

    // ─ Voitures normales (80 × 40) ───────────────────────────────────────
    // Berlines, véhicules légers → hitbox basse (peut parfois passer dessus)
    const normalCars = ['sedan', 'police', 'taxi', 'ambulance', 'van',
                        'scooter', 'kart', 'suv', 'sports_red', 'sports_green',
                        'formula', 'convertible', 'vintage', 'buggy', 'hotdog'];
    if (normalCars.includes(type)) {
      const car = new Enemy(x, 0, 'cars');
      car.width  = 80 * this.scaleFactor;
      car.height = 40 * this.scaleFactor;
      car.sprites.walk = [type];
      const img = new Image();
      img.src = `assets/enemies/sol/Cars/${type}.png`;
      car.imageCache.set(type, img);
      this.obstacles.push(car);
      return;
    }

    // ─ Barnacle (ennemi attaquant, taille moyenne) ────────────────────────
    if (type === 'barnacle') {
      const b = new Enemy(x, 0, 'barnacle');
      b.width  = 56 * this.scaleFactor;
      b.height = 56 * this.scaleFactor;
      this.obstacles.push(b);
      return;
    }

    // ─ Zombie (marche lentement, plus grand que les petits ennemis) ───────
    if (type === 'zombie') {
      const z = new Enemy(x, 0, 'zombie');
      z.width  = 50 * this.scaleFactor;
      z.height = 55 * this.scaleFactor;
      this.obstacles.push(z);
      return;
    }

    // ─ Petits ennemis animés : sauteurs ou marcheurs (45 × 45) ──────────
    // ladybug, souris, blue, green sautent aléatoirement.
    // tr, tu, ty marchent au sol sans sauter.
    const smallAnimated: GroundEnemyKind[] = [
      'ladybug', 'souris', 'blue', 'green', 'tr', 'tu', 'ty',
    ];
    if ((smallAnimated as string[]).includes(type)) {
      const enemy = new Enemy(x, 0, type as GroundEnemyKind);
      enemy.width  = 45 * this.scaleFactor;
      enemy.height = 45 * this.scaleFactor;
      this.obstacles.push(enemy);
      return;
    }
  }

  /**
   * Génère une plateforme sur laquelle le joueur peut sauter.
   *
   * REPÈRE ORTHONORMÉ :
   *  La plateforme est placée entre 60 et 140px AU-DESSUS du sol.
   *  platformWorldY = hauteur au-dessus du sol en coordonnées monde (Y positif).
   *
   *  AVANT (canvas) : height = groundY - (60 + aléatoire × 80) * scale
   *    → calcul complexe partant du bas en coordonnées canvas
   *  MAINTENANT     : platformWorldY = (60 + aléatoire × 80) * scale
   *    → hauteur directe au-dessus du sol, plus lisible
   *
   * STRUCTURE D'UNE PLATEFORME :
   *  [bord gauche] [milieu × N] [bord droit]
   *  Longueur = 2 à 4 segments de 64px chacun.
   */
  private spawnPlatform(x: number): void {
    const zone = this.zoneManager.getCurrentZone();

    // Hauteur de la plateforme au-dessus du sol (coordonnées monde)
    // 60px minimum, 140px maximum au-dessus de Y=0
    const platformWorldY = (60 + Math.random() * 80) * this.scaleFactor;

    const length = 2 + Math.floor(Math.random() * 3); // 2, 3, ou 4 segments

    for (let i = 0; i < length; i++) {
      let spritePath: string;
      if      (i === 0)          spritePath = zone.platforms[0]; // Bord gauche
      else if (i === length - 1) spritePath = zone.platforms[2]; // Bord droit
      else                       spritePath = zone.platforms[1]; // Milieu

      const segment = new Enemy(
        x + i * 64 * this.scaleFactor,
        platformWorldY,              // Y monde du bas de la plateforme
        'platform'
      );
      segment.width  = 64 * this.scaleFactor;
      segment.height = 32 * this.scaleFactor;

      const key = `plat_${i}_${Date.now()}`;
      segment.sprites.walk = [key];
      const img = new Image();
      img.src = spritePath;
      segment.imageCache.set(key, img);

      this.obstacles.push(segment);
    }
  }

  

  /**
   * Vérifie si deux rectangles se chevauchent (AABB).
   *
   * La formule est identique dans les deux repères (canvas ou orthonormé)
   * car elle teste simplement le chevauchement d'intervalles sur chaque axe.
   *
   * Dans les deux cas : [a.y, a.y + a.height] et [b.y, b.y + b.height]
   * se chevauchent si : a.y < b.y + b.height ET a.y + a.height > b.y
   *
   *  Avec marge d'indulgence (margin) pour les passages "justes" :
   *
   *   ┌──────────────┐
   *   │  marge       │  ← zone d'indulgence (pas de collision ici)
   *   │  ┌────────┐  │
   *   │  │ hitbox │  │  ← collision seulement ici
   *   │  └────────┘  │
   *   │  marge       │
   *   └──────────────┘
   */
  private checkCollision(a: GameObject, b: GameObject): boolean {
    const margin = 5 * this.scaleFactor;
    return (
      a.x + margin           < b.x + b.width  - margin &&
      a.x + a.width - margin > b.x + margin            &&
      a.y + margin           < b.y + b.height - margin &&
      a.y + a.height - margin > b.y + margin
    );
  }

  

  private gameOver(): void {
    this.isPlaying = false;
    this.saveHighscore();
    this.audioManager.playDeath(); // Utilisation de death.m4a
    this.audioManager.stopAllMusic();

    if (this.gameOverElement) {
      this.gameOverElement.style.display = 'flex';
      const el = (id: string) => document.getElementById(id);
      const finalEl = el('final-score');
      const bestEl  = el('best-score');
      if (finalEl) finalEl.textContent = Math.floor(this.score).toString();
      if (bestEl)  bestEl.textContent  = this.highScore.toString();
    }
  }

  

  /**
   * Exécutée ~60 fois par seconde via requestAnimationFrame.
   *
   * LOGIQUE (isPlaying && !isPaused) :
   *  1. Score + changement de zone
   *  2. Timer d'obstacles → spawnObstacle()
   *  3. Mise à jour et nettoyage des obstacles
   *  4. Détection collisions + atterrissage plateforme
   *  5. Physique du joueur + vérification sol
   *  6. Défilement du décor
   *  7. Météo (particules)
   *
   * DESSIN (toujours, même en pause) :
   *  fond → sol → joueur → obstacles → HUD → météo → pause ?
   */
  private gameLoop(): void {

    // ── LOGIQUE ───────────────────────────────────────────────────────────
    if (this.isPlaying && !this.isPaused) {

      // 1. Score
      this.score += 0.1;
      if (this.score > this.highScore) this.highScore = Math.floor(this.score);

      // Accélération continue : la vitesse augmente légèrement chaque frame
      // SPEED_INCREASE = 0.003 px/frame² → après 200 pts (~2000 frames) ≈ +6 px/frame
      this.gameSpeed += SPEED_INCREASE * this.scaleFactor;

      // 2. Changement de zone : bonus de vitesse instantané en plus de l'accélération continue
      if (this.zoneManager.updateScore(this.score)) {
        this.background.updateZone();
        this.weatherManager.fetchWeather();
        // Coup d'accélérateur à chaque changement de zone
        this.gameSpeed += ZONE_SPEED_BOOST * this.scaleFactor;
      }

      // 3. Timer d'obstacles
      this.obstacleTimer++;
      if (this.obstacleTimer > this.obstacleInterval) {
        this.spawnObstacle();
        this.obstacleTimer    = 0;
        this.obstacleInterval = 60 + Math.random() * 80;
      }

      // 4. Mise à jour et nettoyage des obstacles
      this.obstacles = this.obstacles.filter(obs => {
        obs.update(this.gameSpeed);
        return obs.x + obs.width > -100;
      });

      // 5. Détection des collisions
      //
      // Les plateformes et les ennemis sont traités SÉPARÉMENT :
      //
      //  PLATEFORMES :
      //   On n'utilise PAS l'AABB (trop de marge → le joueur passerait à travers).
      //   On vérifie directement la position du joueur par rapport au dessus
      //   de la plateforme. Le joueur est posé dessus si :
      //     • chevauchement horizontal (X)
      //     • bas du joueur ≈ haut de la plateforme (±quelques px de tolérance)
      //     • joueur descend (velocityY ≤ 0)
      //   La plateforme n'inflige jamais de dégâts et n'est jamais supprimée.
      //
      //  ENNEMIS :
      //   Collision AABB classique avec marge d'indulgence → dégâts.
      //
      let isOnPlatform = false;

      for (let i = 0; i < this.obstacles.length; i++) {
        const obs        = this.obstacles[i]!;
        const isPlatform = (obs as Enemy).enemyType === 'platform';

        if (isPlatform) {
          // ── Plateforme : test de position directe (sans AABB) ────────────
          //
          // Problème avec l'AABB pour les plateformes :
          //   La marge de 5px fait échouer la détection quand le joueur
          //   est posé dessus (il ne s'y enfonce que de ~0.8px/frame).
          //   Résultat : le joueur tombe à travers et la plateforme disparaît.
          //
          // Solution : test de position explicite, chaque frame.
          //
          // REPÈRE ORTHONORMÉ :
          //   platformTop = obs.y + obs.height  (haut de la plateforme, Y monde)
          //   dino.y      = bas du joueur       (Y monde)
          //   Atterrissage : dino.y ≈ platformTop, en descendant (velocityY ≤ 0)

          const platformTop = obs.y + obs.height;

          // Chevauchement horizontal (le joueur est bien au-dessus de la plateforme)
          const xOverlap = this.dino.x + this.dino.width > obs.x &&
                           this.dino.x < obs.x + obs.width;

          if (xOverlap) {
            // Le bas du joueur doit être légèrement en dessous du haut de la plateforme
            // (il peut s'y enfoncer d'au plus ~40px entre deux frames à haute vitesse)
            const dinoBottom  = this.dino.y;
            const justAbove   = dinoBottom <= platformTop + 2;  // pas encore passé dessous
            const notTooDeep  = dinoBottom >= platformTop - 40; // pas enfoncé trop profond
            const goingDown   = this.dino.velocityY <= 0;        // descend dans le repère

            if (goingDown && justAbove && notTooDeep) {
              // Snap : poser le bas du joueur exactement sur le haut de la plateforme
              this.dino.y         = platformTop;
              this.dino.velocityY = 0;
              this.dino.grounded  = true;
              isOnPlatform        = true;
            }
          }
          // La plateforme ne disparaît jamais et n'inflige jamais de dégâts → continue
          continue;
        }

        // ── Ennemi : collision AABB avec marge d'indulgence ──────────────
        if (!this.checkCollision(this.dino, obs)) continue;

        this.health--;
        this.obstacles.splice(i, 1);
        this.audioManager.playCollision();
        if (this.health <= 0) { this.gameOver(); break; }
      }

      // 6. Physique du joueur
      this.dino.update();

      // Vérification du sol en repère orthonormé :
      //  Si dino.y < 0 → le bas du joueur est passé sous le sol → on le bloque à Y=0
      if (!isOnPlatform && this.dino.y < 0) {
        this.dino.y         = 0;
        this.dino.velocityY = 0;
        this.dino.grounded  = true;
      }

      // Si le joueur n'est plus sur une plateforme et n'est pas au sol (y > 0),
      // il doit tomber librement → grounded = false
      if (!isOnPlatform && this.dino.grounded && this.dino.y > 0) {
        this.dino.grounded = false;
      }

      // 7. Défilement du décor
      this.background.update(this.gameSpeed);
      this.ground.update(this.gameSpeed);

      // 8. Météo
      this.updateWeatherParticles();
    }

    // ── DESSIN ────────────────────────────────────────────────────────────

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Décor (derrière tout)
    this.background.draw(this.ctx);
    this.background.drawFoot(this.ctx);
    this.ground.draw(this.ctx);

    // Joueur et obstacles
    // (chaque draw() convertit ses coordonnées monde → canvas en interne)
    this.dino.draw(this.ctx);
    for (const obs of this.obstacles) {
      obs.draw(this.ctx);
    }

    // Interface utilisateur
    this.drawHUD();

    // Effets météo
    this.drawWeatherEffects();
    this.drawWeatherPanel();

    // La pause est gérée par l'overlay HTML #pause-menu (pas sur le canvas)

    this.animFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  

  /**
   * Dessine le HUD : score, meilleur score, cœurs de vie.
   *
   * Le HUD est dessiné directement en coordonnées canvas (UI fixe en haut),
   * pas besoin de conversion : les éléments UI ne bougent pas avec la physique.
   *
   * DISPOSITION :
   *  [♥♥♥]    [MEILLEUR SCORE]    [SCORE ACTUEL]
   *   gauche       centre              droite
   */
  private drawHUD(): void {
    const scale = this.scaleFactor;

    // ─ Meilleur score — centré, taille × 3 (0.8 → 2.4) ──────────────────
    const highStr   = this.highScore.toString().padStart(6, '0');
    const highScale = 2.4 * scale;
    const centerX   = this.canvas.width / 2 - (6 * 32 * highScale) / 2;
    this.numberRenderer.draw(this.ctx, highStr, centerX, 20 * scale, highScale);

    // ─ Score actuel — en haut à droite, taille × 3 (0.5 → 1.5) ─────────
    const scoreStr   = Math.floor(this.score).toString().padStart(6, '0');
    const scoreScale = 1.5 * scale;
    const scoreX     = this.canvas.width - (6 * 32 * scoreScale) - 20 * scale;
    this.numberRenderer.draw(this.ctx, scoreStr, scoreX, 20 * scale, scoreScale);

    for (let i = 0; i < 3; i++) {
      const pointsForThisHeart = this.health - i * 2;
      let lifeImg: HTMLImageElement | undefined;
      if      (pointsForThisHeart >= 2)  lifeImg = this.lifeImages[0];
      else if (pointsForThisHeart === 1) lifeImg = this.lifeImages[1];
      else                               lifeImg = this.lifeImages[2];

      if (lifeImg) {
        SpriteLoader.drawSafe(this.ctx, lifeImg, 20 * scale + i * 40 * scale, 20 * scale, 32 * scale, 32 * scale);
      }
    }
  }

  

  /**
   * Les particules météo (pluie, neige) sont gérées en coordonnées CANVAS
   * directement : elles tombent depuis le haut (canvas Y=0) vers le bas.
   * Elles ne font pas partie de la physique du monde, donc pas de conversion.
   */
  private particles: { 
    x: number; 
    y: number; 
    speed: number; 
    width: number; 
    height: number; 
    color: string; 
    wind: number 
  }[] = [];

  private updateWeatherParticles(): void {
    const weather = this.weatherManager.getWeatherData();
    if (!weather) return;

    const code = weather.weatherCode;
    // Groupement plus large des codes météo pour les effets visuels
    const isRaining = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
    const isSnowing = [71, 73, 75, 77, 85, 86].includes(code);
    const isStormy  = [95, 96, 99].includes(code);

    if ((isRaining || isSnowing || isStormy) && this.particles.length < 200) {
      const wind = weather.wind || 0;
      
      // Adaptation des particules (Taille et opacité augmentées)
      this.particles.push({
        x:      Math.random() * this.canvas.width,
        y:      -20,
        speed:  (isSnowing ? 2 : 12) + Math.random() * 5,
        width:  isSnowing ? 6 : 3,
        height: isSnowing ? 6 : 25,
        color:  isSnowing ? 'rgba(255, 255, 255, 1.0)' : 'rgba(170, 204, 255, 0.9)',
        wind:   wind * 0.15
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.y += p.speed;
      p.x += p.wind;

      if (p.y > this.canvas.height || p.x > this.canvas.width || p.x < -40) {
        if (isRaining || isSnowing || isStormy) {
           p.y = -20;
           p.x = Math.random() * this.canvas.width;
        } else {
           this.particles.splice(i, 1);
        }
      }
    }
  }

  private drawWeatherEffects(): void {
    const weather = this.weatherManager.getWeatherData();
    if (!weather) return;

    const code = weather.weatherCode;
    const isStormy = [95, 96, 99].includes(code);
    const isFoggy  = [45, 48].includes(code);

    // 1. Brouillard amélioré
    if (isFoggy) {
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, 'rgba(200, 200, 200, 0.6)');
      gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.3)');
      gradient.addColorStop(1, 'rgba(200, 200, 200, 0.1)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 2. Filtre de nuit
    if (this.weatherManager.isNight) {
      this.ctx.fillStyle = 'rgba(10, 10, 30, 0.55)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 3. Particules (Pluie/Neige)
    for (const p of this.particles) {
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x, p.y, p.width, p.height);
    }

    // 4. Éclairs d'orage (plus fréquents et plus intenses)
    if (isStormy && Math.random() < 0.025) {
      const alpha = 0.4 + Math.random() * 0.4; // Opacité variable pour l'éclair
      this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  /** Panneau météo en bas à gauche (coordonnées canvas, UI fixe) */
  private drawWeatherPanel(): void {
    const weather = this.weatherManager.getWeatherData();
    if (!weather) return;

    const scale      = this.scaleFactor;
    const panelW     = 140 * scale; 
    const panelH     =  75 * scale; 
    // Ancré en bas à droite, avec une marge de 20px
    const x = this.canvas.width  - panelW - 20 * scale;
    const y = this.canvas.height - panelH - 20 * scale;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; 
    this.ctx.fillRect(x, y, panelW, panelH);

    this.ctx.fillStyle = '#FFF';
    this.ctx.font = `bold ${14 * scale}px Arial`;
    this.ctx.fillText(`${weather.icon} ${weather.temperature}°C`, x + 8 * scale, y + 22 * scale);

    this.ctx.font = `${10 * scale}px Arial`;
    this.ctx.fillStyle = '#BBB';
    this.ctx.fillText(weather.city, x + 8 * scale, y + 38 * scale);

    this.ctx.font = `${11 * scale}px Arial`;
    this.ctx.fillStyle = '#DDD';
    this.ctx.fillText(`${weather.description} (${weather.wind} km/h)`, x + 8 * scale, y + 58 * scale);
  }

  

  destroy(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', () => this.resize());
  }
}

// cette zone nous sert à lancer le jeu quand la page est prête
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) {
        new Game(canvas);
    }
});
