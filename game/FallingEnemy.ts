

import { GameObject } from './Dino';
import { SpriteLoader } from './SpriteLoader';
import { GROUND_HEIGHT, worldToCanvasY } from './constants';

export class FallingEnemy implements GameObject {

  
  //  x = position horizontale
  //  y = coordonnée monde Y du BAS du bloc (Y=0 = surface du sol)
  x: number;
  y: number;
  width  = 60;
  height = 60;

  
  //  velocityY : vitesse verticale en repère orthonormé
  //    > 0 → monte ↑ (rebond)
  //    < 0 → descend ↓ (chute)
  //    = 0 → au repos
  private velocityY = 0;
  private readonly FALL_GRAVITY = 0.75; // Accélération de la chute (px/frame²)
  private readonly BOUNCE       = 0.3;  // Coefficient de rebond (0 = aucun, 1 = parfait)

  
  private phase: 'idle' | 'falling' | 'resting' = 'idle';

  // Distance horizontale (depuis le bord gauche) qui déclenche la chute
  private readonly TRIGGER_DISTANCE = 450;

  
  private images: Map<string, HTMLImageElement> = new Map();
  private currentImage: HTMLImageElement | null = null;

  

  /**
   * @param x            - Position X de départ (à droite du canvas)
   * @param canvasHeight - Hauteur totale du canvas (pour calculer la position initiale)
// cette zone nous sert à gérer les trucs importants
   *
   * La position initiale Y monde = canvasHeight - GROUND_HEIGHT
   * = hauteur de l'aire de jeu = sommet de l'écran dans le repère orthonormé
   */
  constructor(x: number, canvasHeight: number) {
    this.x = x;
    // Le bloc commence au sommet de l'aire de jeu (coin haut en monde = grande valeur Y)
    this.y = canvasHeight - GROUND_HEIGHT;
    this.loadSprites();
  }

  

  private async loadSprites(): Promise<void> {
    try {
      const spriteDefs = [
        { key: 'idle',    path: 'assets/enemies/tombe/bloc/block_idle.png' },
        { key: 'falling', path: 'assets/enemies/tombe/bloc/block_fall.png' },
        { key: 'resting', path: 'assets/enemies/tombe/bloc/block_rest.png' },
      ];

      for (const { key, path } of spriteDefs) {
        const img = new Image();
        img.src = path;
        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        this.images.set(key, img);
      }

      this.currentImage = this.images.get('idle') ?? null;
    } catch {
      // images not loaded, but handled by drawSafe
    }
  }

  

  /**
   * Gère le déplacement horizontal + les 3 phases de chute.
   *
// ici on fait la magie pour que ça bouge
   * PHYSIQUE (repère orthonormé) :
   *   Chute   : velocityY -= FALL_GRAVITY → velocityY devient de plus en plus négatif
   *             y += velocityY            → Y diminue → le bloc descend ↓
   *   Rebond  : y ≤ 0                     → le bas touche le sol
   *             velocityY = |velocityY| × BOUNCE → petite impulsion vers le haut
   *             Si rebond trop faible (< 1) → phase "resting"
   */
  update(speed: number): void {
    // 1. Déplacement vers la gauche
    this.x -= speed;

    // 2. Phase "idle" → déclencher la chute quand le joueur s'approche
    if (this.phase === 'idle' && this.x < this.TRIGGER_DISTANCE) {
      this.phase        = 'falling';
      this.currentImage = this.images.get('falling') ?? this.currentImage;
    }

    // 3. Phase "falling" → chute avec accélération gravitationnelle
    if (this.phase === 'falling') {
      // La gravité diminue velocityY (le rend de plus en plus négatif → accélération vers le bas)
      this.velocityY -= this.FALL_GRAVITY;

      // Mettre à jour la position monde Y
      this.y += this.velocityY;

      // Détection du sol (y ≤ 0 = bas du bloc atteint la surface du sol)
      if (this.y <= 0) {
        this.y = 0; // Empêcher le bloc de passer sous le sol

        // Rebond : inverser la vitesse avec atténuation
        // velocityY était négatif (chute) → devient positif (rebond vers le haut)
        this.velocityY = Math.abs(this.velocityY) * this.BOUNCE;

        // Si le rebond est trop faible, le bloc s'arrête
        if (this.velocityY < 1) {
          this.phase     = 'resting';
          this.velocityY = 0;
          this.currentImage = this.images.get('resting') ?? this.currentImage;
        }
      }
// c'est là qu'on définit les variables de base
    }
    // Phase "resting" → le bloc reste au sol (rien à faire, velocityY = 0)
  }

  

  /**
   * Dessine le bloc après conversion de coordonnées monde → canvas.
   *
   * this.y (monde) → worldToCanvasY() → canvasY (canvas) → drawImage()
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const img = this.currentImage;
    if (img) {
      const canvasY = worldToCanvasY(this.y, this.height, ctx.canvas.height);
      SpriteLoader.drawSafe(ctx, img, Math.floor(this.x), Math.floor(canvasY), this.width, this.height);
    }
  }
}
