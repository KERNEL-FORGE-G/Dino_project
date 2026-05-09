

import { ZoneManager } from './ZoneManager';
import { SpriteLoader } from './SpriteLoader';
import { GROUND_HEIGHT } from './constants';

export class Ground {

  private zoneManager: ZoneManager;

  /** Images préchargées pour chaque sol (chemin → image) */
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;

  /** Décalage horizontal courant du sol (augmente avec le temps) */
  private scrollX: number = 0;

  constructor() {
    this.zoneManager = ZoneManager.getInstance();
    this.loadGroundImages();
  }

  

  /** Précharge les 3 textures de sol une seule fois au démarrage */
  private async loadGroundImages(): Promise<void> {
    const grounds = [
      'assets/map/sol/white_zone.svg',
      'assets/map/sol/green_zone.svg',
      'assets/map/sol/orange_zone.svg',
    ];

    for (const path of grounds) {
      const img = await SpriteLoader.load(path);
      this.images.set(path, img);
    }

    this.loaded = true;
  }

// cette zone nous sert à gérer les trucs importants
  

  /** Fait défiler le sol de `gameSpeed` pixels vers la gauche */
  update(gameSpeed: number): void {
    this.scrollX -= gameSpeed;
  }

  /** Remet le défilement à zéro (appelé au restart) */
  reset(): void {
    this.scrollX = 0;
  }

  

  /**
   * Dessine la bande de sol en bas du canvas.
   * L'image est répétée horizontalement en boucle.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.loaded) return;

    const zone  = this.zoneManager.getCurrentZone();
    const img   = this.images.get(zone.groundTexture);
    if (!img || img.naturalWidth === 0) return;

    const W         = ctx.canvas.width;
    const H         = ctx.canvas.height;
    const groundY   = H - GROUND_HEIGHT;
    const imgWidth  = img.naturalWidth;

    // Point de départ du premier tile (modulo pour boucler proprement)
    const startX = this.scrollX % imgWidth;

    // Dessiner suffisamment de tiles pour couvrir tout le canvas
    for (let x = startX - imgWidth; x < W + imgWidth; x += imgWidth) {
      SpriteLoader.drawSafe(ctx, img, x, groundY, imgWidth, GROUND_HEIGHT);
    }
  }
}
