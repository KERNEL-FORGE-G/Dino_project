

import { GameObject } from './Dino';
import { SpriteLoader } from './SpriteLoader';
import { worldToCanvasY } from './constants';

export class Bird implements GameObject {

  
  x: number;
  y: number;
  width  = 60;
  height = 60;

  
  private birdType: 'mouche' | 'bee' | 'bat' | 'ovnie';
  private ovnieColor = 'Blue';

  
  private wingFrame  = 0; // Index de la frame courante
  private frameTimer = 0;
  private frameCount = 2; // 2 pour mouche/bee, 3 pour bat

  
  private imageCache: HTMLImageElement[] = [];
  private imagesLoaded = false;

  

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    // Répartition :  30% mouche | 30% bee | 20% bat | 20% ovnie
    const rand = Math.random();
    if      (rand < 0.30) { this.birdType = 'mouche'; this.frameCount = 2; }
    else if (rand < 0.60) { this.birdType = 'bee';    this.frameCount = 2; }
    else if (rand < 0.80) { this.birdType = 'bat';    this.frameCount = 3; }
    else                  { this.birdType = 'ovnie';  this.frameCount = 1; }

    // Couleur aléatoire pour l'OVNI parmi les 5 disponibles
// cette zone nous sert à gérer les trucs importants
    if (this.birdType === 'ovnie') {
      const colors = ['Beige', 'Blue', 'Green', 'Pink', 'Yellow'];
      this.ovnieColor = colors[Math.floor(Math.random() * colors.length)]!;
    }

    this.loadSprites();
  }

  

  private async loadSprites(): Promise<void> {

    if (this.birdType === 'ovnie') {
      // OVNI : une seule image par couleur (5 couleurs disponibles)
      const img = new Image();
      img.src = `assets/enemies/airs/ovnie/ship${this.ovnieColor}_manned.png`;
      await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      this.imageCache = [img];

    } else if (this.birdType === 'mouche') {
      // Mouche : 2 frames (fly_a, fly_b) dans assets/enemies/airs/mouche/
      for (const suffix of ['_a.png', '_b.png']) {
        const img = new Image();
        img.src = `assets/enemies/airs/mouche/fly${suffix}`;
        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        this.imageCache.push(img);
      }

    } else if (this.birdType === 'bee') {
      // Abeille : 2 frames (bee_a, bee_b) dans assets/enemies/airs/bee/
      for (const suffix of ['_a.png', '_b.png']) {
        const img = new Image();
        img.src = `assets/enemies/airs/bee/bee${suffix}`;
        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        this.imageCache.push(img);
      }

    } else if (this.birdType === 'bat') {
      // Chauve-souris : 3 frames (bat_a, bat_b, bat_c) dans assets/enemies/airs/other/
      for (const suffix of ['_a.png', '_b.png', '_c.png']) {
// ici on fait la magie pour que ça bouge
        const img = new Image();
        img.src = `assets/enemies/airs/other/bat${suffix}`;
        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
        this.imageCache.push(img);
      }
    }

    this.imagesLoaded = this.imageCache.some(img => img.complete && img.naturalWidth > 0);
  }

  

  update(speed: number): void {
    // 1. Déplacement vers la gauche (× 1.2 : les aériens sont plus rapides)
    this.x -= speed * 1.2;

    if (this.birdType === 'ovnie') {
      // L'OVNI oscille verticalement avec une courbe sinusoïdale douce.
      // Dans le repère orthonormé, Y croît vers le haut.
      this.y += Math.sin(Date.now() / 200) * 0.5;

    } else {
      // Animation des ailes : changer de frame toutes les 8 frames de jeu
      // frameCount = 2 pour mouche/bee, 3 pour bat
      this.frameTimer++;
      if (this.frameTimer > 8) {
        this.wingFrame  = (this.wingFrame + 1) % this.frameCount;
        this.frameTimer = 0;
      }
    }
  }

  

  /**
   * Dessine l'oiseau après conversion de coordonnées monde → canvas.
   *
   * this.y (monde, bas de l'objet) → worldToCanvasY → canvasY (haut du sprite)
   */
  draw(ctx: CanvasRenderingContext2D): void {
// c'est là qu'on définit les variables de base
    if (!this.imagesLoaded) return;

    const img = this.imageCache[this.wingFrame];
    if (img) {
      const canvasY = worldToCanvasY(this.y, this.height, ctx.canvas.height);
      SpriteLoader.drawSafe(ctx, img, Math.floor(this.x), Math.floor(canvasY), this.width, this.height);
    }
  }
}
