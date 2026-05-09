

import { AvatarManager } from './AvatarManager';
import { SpriteLoader } from './SpriteLoader';
import { worldToCanvasY } from './constants';

/** Interface partagée pour tout objet du jeu (joueur, ennemis...) */
export interface GameObject {
  x: number;
  y: number;       // Coordonnée monde Y du BAS de l'objet (Y=0 = sol)
  width: number;
  height: number;
  update(speed?: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

export class Dino implements GameObject {

  
  //  x     = position horizontale (identique monde/canvas, X inchangé)
  //  y     = coordonnée monde Y du BAS du joueur (Y=0 = surface du sol)
  //  width / height = dimensions de la hitbox de collision
  x      = 50;
  y      = 0;    // Posé sur le sol au démarrage
  width  = 60;
  height = 44;   // Hauteur debout (= normalHeight)

  
  //  velocityY > 0 → monte (vers le haut ↑ dans le repère orthonormé)
  //  velocityY < 0 → descend (vers le bas ↓, effet de la gravité)
  public velocityY  = 0;
  public grounded   = true;   // Vrai si le personnage touche le sol ou une plateforme
  public ducking    = false;  // Vrai quand la flèche bas est enfoncée

  readonly gravity      = 0.8;  // Accélération gravitationnelle (px/frame²)
  readonly jumpForce    = 14;   // Force de saut (positif = vers le haut ↑)
  readonly normalHeight = 44;   // Hauteur debout
  readonly duckHeight   = 25;   // Hauteur accroupi

  
  private canDoubleJump = false; // Un seul double-saut autorisé par envol
// cette zone nous sert à gérer les trucs importants

  
  private currentAnimation = 'idle';
  private animationFrame   = 0;
  private animationTimer   = 0;

  
  private sprites: { [key: string]: string[] } = {};
  private currentAvatarPath = '';
  private imagesLoaded  = false;
  private imageCache: Map<string, HTMLImageElement> = new Map();

  /**
   * Indique si l'avatar possède un sprite duck DISTINCT du sprite idle.
   *
   *  true  → l'avatar a son propre sprite accroupi → on le dessine à normalHeight
   *           (le sprite lui-même montre le personnage accroupi, inutile de changer la taille)
   *  false → pas de sprite duck propre (fallback = idle)
   *           → on rapetisse visuellement le personnage à duckHeight
   */
  private hasDuckSprite = false;

  
  constructor() {
    this.loadSprites();
  }

  

  async loadSprites(): Promise<void> {
    try {
      const avatar = AvatarManager.getInstance().getSelectedAvatar();
      this.currentAvatarPath = avatar.path;

      this.sprites.idle = [avatar.sprites.idle.replace('.png', '')];
      this.sprites.run  = avatar.sprites.walk.map(s => s.replace('.png', ''));
      this.sprites.jump = [avatar.sprites.jump.replace('.png', '')];
      this.sprites.dead = [avatar.sprites.hurt.replace('.png', '')];
      this.sprites.duck = [avatar.sprites.duck.replace('.png', '')];

// ici on fait la magie pour que ça bouge
      // Détecte si l'avatar a un sprite duck DISTINCT du sprite idle.
      // Si duck === idle (fallback), on n'a pas de vraie animation accroupie.
      this.hasDuckSprite = avatar.sprites.duck !== avatar.sprites.idle;

      const pathsToLoad = [
        `${avatar.path}/${avatar.sprites.idle}`,
        ...avatar.sprites.walk.map(s => `${avatar.path}/${s}`),
        `${avatar.path}/${avatar.sprites.jump}`,
        `${avatar.path}/${avatar.sprites.hurt}`,
        `${avatar.path}/${avatar.sprites.duck}`,
      ];

      for (const path of pathsToLoad) {
        const img = new Image();
        img.src = path;
        await new Promise(resolve => {
          img.onload  = resolve;
          img.onerror = resolve;
        });
        const name = path.split('/').pop()?.replace('.png', '') ?? '';
        this.imageCache.set(name, img);
      }

      this.imagesLoaded = true;
    } catch {
      // Continue sans sprites si le chargement échoue
    }
  }

  

  /**
   * Déclenche un saut ou un double-saut.
   *
   * Dans le repère orthonormé :
   *  - jumpForce est POSITIF (+14) → velocityY devient positif → Y augmente → monte ↑
   *  - La gravité ramènera ensuite velocityY en négatif → redescente ↓
   */
  jump(): void {
    if (this.grounded) {
// c'est là qu'on définit les variables de base
      this.velocityY     = this.jumpForce;       // Impulsion vers le haut (Y croît)
      this.grounded      = false;
      this.canDoubleJump = true;                 // Autorise un double-saut
    } else if (this.canDoubleJump) {
      this.velocityY     = this.jumpForce * 0.85; // Double-saut légèrement moins puissant
      this.canDoubleJump = false;
    }
  }

  /**
   * Active ou désactive l'accroupissement.
   *
   * IMPORTANT — séparation hitbox / visuel :
   *  this.height  → hitbox de collision (réduite à duckHeight)
   *                 Permet de passer SOUS les ennemis aériens.
   *  draw()       → utilise drawHeight (voir ci-dessous) pour l'affichage,
   *                 qui est INDÉPENDANT de la hitbox.
   *
   * Règle d'affichage :
   *  - Sprite duck réel (hasDuckSprite = true)  → drawHeight = normalHeight
   *    Le sprite représente déjà le personnage accroupi ; on le dessine à taille pleine.
   *    Le bas du sprite reste ancré au sol. Pas d'enfoncement dans le sol.
   *  - Pas de sprite duck (hasDuckSprite = false) → drawHeight = duckHeight
   *    On rapetisse le personnage visuellement (effet "duck" simulé).
   */
  duck(active: boolean): void {
    this.ducking = active;
    this.height  = active ? this.duckHeight : this.normalHeight;
  }

  

  /**
   * Met à jour la physique du joueur chaque frame.
   *
   * PHYSIQUE (repère orthonormé) :
   *  1. velocityY -= gravity   → la gravité diminue la vitesse verticale
   *     (si on monte, ça ralentit ; si on descend, ça accélère la chute)
   *  2. y += velocityY         → la position est mise à jour
   *  3. Le sol (y < 0) est géré dans Game.ts
// petit bout de code pour que tout fonctionne bien
   *
   * AVANT (canvas standard) :  velocityY += gravity → Y augmente → tombe ↓
   * MAINTENANT (orthonormé)  :  velocityY -= gravity → Y diminue → tombe ↓
   */
  update(): void {
    // 1. Gravité : diminue la vitesse verticale chaque frame
    //    Quand velocityY passe en négatif, le joueur commence à descendre
    this.velocityY -= this.gravity;

    // 2. Déplacement vertical : applique la vitesse à la position monde Y
    this.y += this.velocityY;

    // 3. Choisir l'animation selon l'état
    let newAnim = this.currentAnimation;
    if (!this.grounded)    newAnim = 'jump';
    else if (this.ducking) newAnim = 'duck';
    else                   newAnim = 'run';

    if (newAnim !== this.currentAnimation) {
      this.currentAnimation = newAnim;
      this.animationFrame   = 0;
      this.animationTimer   = 0;
    }

    // 4. Avancer l'animation (changer de frame toutes les N frames)
    this.animationTimer++;
    const frames = this.sprites[this.currentAnimation];
    if (frames && frames.length > 1) {
      const delay = this.currentAnimation === 'run' ? 8 : 10;
      if (this.animationTimer > delay) {
        this.animationFrame = (this.animationFrame + 1) % frames.length;
        this.animationTimer = 0;
      }
    }
  }

  

  /**
   * Dessine le personnage sur le canvas.
// j'espère que cette partie ne va pas bugger
   *
   * CONVERSION DE COORDONNÉES :
   *  this.y est en coordonnées MONDE (Y vers le haut, Y=0 = sol).
   *  ctx.drawImage() attend des coordonnées CANVAS (Y vers le bas).
   *
   *  On utilise worldToCanvasY() pour convertir :
   *    canvasY = canvasHeight - GROUND_HEIGHT - worldY - objectHeight
   *
   *  Ainsi, un objet à worldY=0 (sol) sera dessiné exactement
   *  au-dessus de la bande de sol visible.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.imagesLoaded) return;

    const frames = this.sprites[this.currentAnimation];
    const spriteName = frames?.[this.animationFrame];
    if (!spriteName) return;

    // ── Séparation hitbox / hauteur visuelle ─────────────────────────────────
    //
    //  this.height = hitbox (petite quand accroupi → collision avec obstacles)
    //  drawHeight  = hauteur du sprite dessiné à l'écran
    //
    //  Règle :
    //   • Sprite duck réel (hasDuckSprite)  → drawHeight = normalHeight
    //     L'image elle-même montre le personnage accroupi.
    //     On l'ancre au sol sans changer sa taille → aucun "enfoncement".
    //
    //   • Pas de sprite duck (fallback idle) → drawHeight = duckHeight
    //     On simule l'accroupissement en rapetissant le personnage.
    //
    //  Dans les deux cas, worldToCanvasY(y, drawHeight) ancre le BAS
    //  du sprite exactement à la surface du sol (y = 0 en monde).
    //
    const drawHeight = (this.ducking && !this.hasDuckSprite)
      ? this.duckHeight    // Pas de sprite duck : personnage rapetissé
      : this.normalHeight; // Sprite duck réel (ou debout) : taille pleine

    // Convertit y (bas du joueur, monde) → canvasY (haut du sprite, canvas)
    const canvasY = worldToCanvasY(this.y, drawHeight, ctx.canvas.height);

    let img = this.imageCache.get(spriteName);
    if (!img) {
      img = new Image();
      img.src = `${this.currentAvatarPath}/${spriteName}.png`;
      this.imageCache.set(spriteName, img);
    }

    if (img) {
      SpriteLoader.drawSafe(ctx, img, this.x, canvasY, this.width, drawHeight);
    }
  }

  

  /** Remet le joueur dans son état initial (appelé au restart) */
  reset(): void {
    this.x              = 50;
    this.y              = 0;     // Sol en coordonnées monde (Y=0)
    this.height         = this.normalHeight;
    this.velocityY      = 0;
    this.grounded       = true;
    this.ducking        = false;
    this.canDoubleJump  = false;
    this.currentAnimation = 'idle';
    this.animationFrame   = 0;
    this.animationTimer   = 0;
    this.loadSprites();
  }
}
