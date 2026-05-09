

import { GameObject } from './Dino';
import { SpriteLoader } from './SpriteLoader';
import { worldToCanvasY } from './constants';

export type GroundEnemyKind =
  | 'ladybug' | 'souris' | 'zombie' | 'barnacle'
  | 'blue' | 'green' | 'tr' | 'tu' | 'ty'
  | 'cars' | 'platform';

export class Enemy implements GameObject {

  
  //  x = position horizontale (inchangée, même dans les deux repères)
  //  y = coordonnée monde Y du BAS de l'ennemi (Y=0 = surface du sol)
  x: number;
  y: number;
  width  = 60;
  height = 60;

  public enemyType: GroundEnemyKind;

  
  private animationFrame   = 0;
  private animationTimer   = 0;
  private currentAnimation = 'walk';

  public sprites: { [key: string]: string[] } = {};
  public imageCache: Map<string, HTMLImageElement> = new Map();
  private imagesLoaded = false;

  
  //
  //  Le saut suit une courbe sinusoïdale :
  //
  //    Monde Y ↑
  //       │   ╭───╮       ← pic du saut (initialY + jumpHeight)
  //       │  ╱     ╲
  //       │ ╱       ╲
  //       │╱         ╲
// cette zone nous sert à gérer les trucs importants
  //       └────────────→  temps (frames)
  //   initialY          initialY  ← retour au sol
  //
  //  Formule : y = initialY + sin(progress × π) × jumpHeight
  //  progress va de 0.0 à 1.0 pendant JUMP_DURATION frames
  //
  private isJumping = false;
  private jumpTimer = 0;
  private readonly JUMP_DURATION = 24;
  private initialY: number;

  

  constructor(x: number, y: number, type: GroundEnemyKind = 'ladybug') {
    this.x        = x;
    this.y        = y;
    this.initialY = y;
    this.enemyType = type;
    this.loadSprites();
  }

  

  private async loadSprites(): Promise<void> {
    try {
      // Les types 'cars' et 'platform' chargent leurs sprites en dehors de cette classe
      // (Game.ts injecte directement l'image dans imageCache)
      if (this.enemyType === 'cars' || this.enemyType === 'platform') {
        this.imagesLoaded = true;
        return;
      }

      type SpriteConfig = { name: string; path: string };
      const spritesToLoad: SpriteConfig[] = [];

      // ── Coccinelle ─────────────────────────────────────────────────────────
      if (this.enemyType === 'ladybug') {
        this.sprites.walk = ['ladybug_walk_a', 'ladybug_walk_b'];
        this.sprites.idle = ['ladybug_idle'];
        spritesToLoad.push(
// ici on fait la magie pour que ça bouge
          { name: 'ladybug_idle',   path: 'assets/enemies/sol/ladybug/ladybug_idle.png'   },
          { name: 'ladybug_walk_a', path: 'assets/enemies/sol/ladybug/ladybug_walk_a.png' },
          { name: 'ladybug_walk_b', path: 'assets/enemies/sol/ladybug/ladybug_walk_b.png' },
        );

      // ── Souris ─────────────────────────────────────────────────────────────
      } else if (this.enemyType === 'souris') {
        this.sprites.walk = ['mouse_walk_a', 'mouse_walk_b'];
        this.sprites.idle = ['souris_idle'];
        spritesToLoad.push(
          { name: 'souris_idle',  path: 'assets/enemies/sol/souris/souris_idle.png'  },
          { name: 'mouse_walk_a', path: 'assets/enemies/sol/souris/mouse_walk_a.png' },
          { name: 'mouse_walk_b', path: 'assets/enemies/sol/souris/mouse_walk_b.png' },
        );

      // ── Zombie ─────────────────────────────────────────────────────────────
      // Utilise les sprites individuels du dossier Poses/
      // (NE PAS utiliser zombie_tilesheet.png : il contient toutes les frames
      //  en une seule image — drawImage() l'afficherait toute aplatie)
      } else if (this.enemyType === 'zombie') {
        this.sprites.idle = ['zombie_idle'];
        this.sprites.walk = ['zombie_walk1', 'zombie_walk2'];
        spritesToLoad.push(
          { name: 'zombie_idle',  path: 'assets/enemies/sol/Zombie/Poses/zombie_idle.png'  },
          { name: 'zombie_walk1', path: 'assets/enemies/sol/Zombie/Poses/zombie_walk1.png' },
          { name: 'zombie_walk2', path: 'assets/enemies/sol/Zombie/Poses/zombie_walk2.png' },
        );

      // ── Barnacle ───────────────────────────────────────────────────────────
      // Ennemi stationnaire qui attaque : cycle entre 2 frames d'attaque
      } else if (this.enemyType === 'barnacle') {
        this.sprites.walk = ['barnacle_attack_a', 'barnacle_attack_b'];
        this.sprites.idle = ['barnacle_attack_rest'];
        spritesToLoad.push(
          { name: 'barnacle_attack_a',    path: 'assets/enemies/sol/barnacle/barnacle_attack_a.png'    },
          { name: 'barnacle_attack_b',    path: 'assets/enemies/sol/barnacle/barnacle_attack_b.png'    },
          { name: 'barnacle_attack_rest', path: 'assets/enemies/sol/barnacle/barnacle_attack_rest.png' },
        );

      // ── Créature bleue ─────────────────────────────────────────────────────
// c'est là qu'on définit les variables de base
      } else if (this.enemyType === 'blue') {
        this.sprites.walk = ['blue_walk'];
        this.sprites.idle = ['blue_idle'];
        spritesToLoad.push(
          { name: 'blue_idle', path: 'assets/enemies/sol/other/blue_idle.png' },
          { name: 'blue_walk', path: 'assets/enemies/sol/other/blue_walk.png' },
        );

      // ── Créature verte ─────────────────────────────────────────────────────
      } else if (this.enemyType === 'green') {
        this.sprites.walk = ['green_walk'];
        this.sprites.idle = ['green_idle'];
        spritesToLoad.push(
          { name: 'green_idle', path: 'assets/enemies/sol/other/green_idle.png' },
          { name: 'green_walk', path: 'assets/enemies/sol/other/green_walk.png' },
        );

      // ── Ennemis tr / tu / ty (petites créatures colorées) ─────────────────
      } else if (this.enemyType === 'tr' || this.enemyType === 'tu' || this.enemyType === 'ty') {
        const n = this.enemyType;
        this.sprites.walk = [`${n}_walk`];
        this.sprites.idle = [`${n}_idle`];
        this.sprites.rest = [`${n}_rest`];
        spritesToLoad.push(
          { name: `${n}_idle`, path: `assets/enemies/sol/other/${n}_idle.png` },
          { name: `${n}_walk`, path: `assets/enemies/sol/other/${n}_walk.png` },
          { name: `${n}_rest`, path: `assets/enemies/sol/other/${n}_rest.png` },
        );
      }

      // Chargement de toutes les images avec attente (pour éviter les frames vides)
      for (const { name, path } of spritesToLoad) {
        const img = new Image();
        img.src = path;
        await new Promise(resolve => {
          img.onload  = resolve;
          img.onerror = resolve;
        });
        this.imageCache.set(name, img);
      }
// petit bout de code pour que tout fonctionne bien

      this.imagesLoaded = true;
    } catch {
      this.imagesLoaded = true;
    }
  }

  

  update(speed: number): void {
    // 1. Déplacement vers la gauche (X diminue)
    this.x -= speed;

    // 2. Saut aléatoire pour les petits ennemis bondissants
    const canJump = ['ladybug', 'souris', 'blue', 'green'].includes(this.enemyType);
    if (canJump) {
      this.updateJump();
    }

    // 3. Avancer l'animation (change de frame toutes les 10 frames)
    this.animationTimer++;
    const frames = this.sprites[this.currentAnimation];
    if (frames && frames.length > 1 && this.animationTimer > 10) {
      this.animationFrame = (this.animationFrame + 1) % frames.length;
      this.animationTimer = 0;
    }
  }

  /**
   * Gère le saut aléatoire des petits ennemis.
   *
   * REPÈRE ORTHONORMÉ :
   *  La formule est : y = initialY + sin(t) × hauteur
   *  Le sinus est positif (0 → π), donc Y augmente (monte) puis revient à 0.
   */
  private updateJump(): void {
    if (!this.isJumping && Math.random() < 0.01) {
      this.isJumping = true;
      this.jumpTimer = 0;
    }
// j'espère que cette partie ne va pas bugger

    if (this.isJumping) {
      this.jumpTimer++;
      const jumpHeight = 50;

      const progress = this.jumpTimer / this.JUMP_DURATION;
      this.y = this.initialY + Math.sin(progress * Math.PI) * jumpHeight;

      if (this.jumpTimer >= this.JUMP_DURATION) {
        this.isJumping = false;
        this.y = this.initialY;
      }
    }
  }

  

  /**
   * Dessine l'ennemi sur le canvas après conversion de coordonnées.
   *
   * this.y (monde) → worldToCanvasY() → canvasY (canvas) → drawImage()
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.imagesLoaded) return;

    const frames = this.sprites[this.currentAnimation];
    const spriteName = frames?.[this.animationFrame];
    if (!spriteName) return;

    const img = this.imageCache.get(spriteName);
    if (img) {
      const canvasY = worldToCanvasY(this.y, this.height, ctx.canvas.height);
      SpriteLoader.drawSafe(ctx, img, Math.floor(this.x), Math.floor(canvasY), this.width, this.height);
    }
  }
}
