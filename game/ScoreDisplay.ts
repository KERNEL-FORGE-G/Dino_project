

import { SpriteLoader } from './SpriteLoader';

export class ScoreDisplay {

  private numberSprites: Map<string, HTMLImageElement> = new Map();
  private lifeSprites: HTMLImageElement[] = [];
  private loaded: boolean = false;

  constructor() {
    this.loadSprites();
  }

  

  private async loadSprites(): Promise<void> {
    // Chargement des chiffres 0-9
    const digits = ['0','1','2','3','4','5','6','7','8','9'];
    for (const d of digits) {
      const img = await SpriteLoader.load(`assets/map/numbers/${d}.png`);
      this.numberSprites.set(d, img);
    }

    // Chargement des 3 états de cœur (plein, demi, vide)
    for (let i = 1; i <= 3; i++) {
      const img = await SpriteLoader.load(`assets/map/lifes/life${i}.png`);
      this.lifeSprites.push(img);
    }

    this.loaded = true;
  }

  

  /**
   * Dessine une chaîne de chiffres à une position donnée.
   * Chaque chiffre est une image sprite dessinée côte à côte.
   *
   * @param ctx    - Contexte de dessin
// cette zone nous sert à gérer les trucs importants
   * @param text   - Chaîne de chiffres, ex: "001234"
   * @param x, y   - Position en haut à gauche
   * @param scale  - Facteur d'échelle (1 = taille naturelle)
   */
  drawNumber(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number, y: number,
    scale: number = 1
  ): void {
    if (!this.loaded) return;

    let cursorX = x;

    for (const char of text) {
      const img = this.numberSprites.get(char);
      if (!img || !img.complete || img.naturalWidth === 0) continue;

      const w = img.naturalWidth  * scale;
      const h = img.naturalHeight * scale;

      SpriteLoader.drawSafe(ctx, img, cursorX, y, w, h);
      cursorX += w + 2 * scale; // Petit espacement entre les chiffres
    }
  }

  

  /**
   * Dessine les 3 cœurs de vie du joueur en haut à gauche.
   *
   * @param ctx       - Contexte de dessin
   * @param health    - Points de vie actuels (0 à 6)
   * @param scale     - Facteur d'échelle
   */
  drawHearts(ctx: CanvasRenderingContext2D, health: number, scale: number): void {
    if (!this.loaded || this.lifeSprites.length < 3) return;

    const heartSize = 32 * scale;
    const heartSpacing = 40 * scale;
// ici on fait la magie pour que ça bouge
    const x0 = 20 * scale;
    const y0 = 20 * scale;

    for (let i = 0; i < 3; i++) {
      // Points représentés par ce cœur (les 2 premiers points, les 2 suivants, etc.)
      const pointsForThisHeart = health - i * 2;

      let sprite: HTMLImageElement;
      if (pointsForThisHeart >= 2) sprite = this.lifeSprites[0]!; // Plein
      else if (pointsForThisHeart === 1) sprite = this.lifeSprites[1]!; // Demi
      else sprite = this.lifeSprites[2]!; // Vide

      SpriteLoader.drawSafe(ctx, sprite, x0 + i * heartSpacing, y0, heartSize, heartSize);
    }
  }
}
