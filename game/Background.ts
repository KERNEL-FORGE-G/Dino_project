

import { ZoneManager } from './ZoneManager';
import { SpriteLoader } from './SpriteLoader';
import { TILE_SIZE, BG_SCROLL_SPEED, FOOT_SCROLL_SPEED, GROUND_HEIGHT } from './constants';

export class Background {

  private zoneManager: ZoneManager;
  private tileImages: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;

  /** Position X accumulée — sert à calculer le décalage de chaque tuile */
  private scrollOffset: number = 0;

  constructor() {
    this.zoneManager = ZoneManager.getInstance();
    this.loadCurrentZoneTiles();
  }

  

  /**
   * Charge toutes les images de tuiles de la zone actuelle.
   * Appelé au démarrage et à chaque changement de zone.
   */
  private async loadCurrentZoneTiles(): Promise<void> {
    this.loaded = false;

    const zone = this.zoneManager.getCurrentZone();

    // On collecte tous les chemins de la zone (head + body + foot)
    const allPaths = [
      ...zone.background.head,
      ...zone.background.body,
      ...zone.background.foot,
    ];

    // Chargement en parallèle de toutes les images
    for (const path of allPaths) {
// cette zone nous sert à gérer les trucs importants
      if (this.tileImages.has(path)) continue; // Déjà en cache, on saute
      const img = await SpriteLoader.load(path);
      this.tileImages.set(path, img);
    }

    this.loaded = true;
  }

  

  /**
   * Avance le décor selon la vitesse du jeu.
   * @param gameSpeed - Vitesse courante du jeu (px/frame)
   */
  update(gameSpeed: number): void {
    if (this.loaded) {
      this.scrollOffset += gameSpeed;
    }
  }

  /** Recharge les tuiles quand on entre dans une nouvelle zone */
  updateZone(): void {
    this.loadCurrentZoneTiles();
  }

  

  /**
   * Dessine les couches head et body du décor (arrière-plan lointain).
   * À appeler EN PREMIER dans la boucle de rendu.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.loaded) return;

    const { width: W, height: H } = ctx.canvas;
    const zone = this.zoneManager.getCurrentZone();

    // Calcul du décalage de défilement lent (parallaxe lointain)
    // Le modulo évite que scrollOffset grossisse à l'infini
    const offsetX = -(this.scrollOffset * BG_SCROLL_SPEED) % TILE_SIZE;
// ici on fait la magie pour que ça bouge

    const headImg = this.tileImages.get(zone.background.head[0] ?? '');
    const bodyImg = this.tileImages.get(zone.background.body[0] ?? '');

    // On dessine des colonnes de tuiles de gauche à droite
    // On commence une tuile avant le bord pour combler le décalage
    for (let x = offsetX - TILE_SIZE; x < W + TILE_SIZE; x += TILE_SIZE) {
      // Tuile du ciel / horizon (couche haute)
      if (headImg) {
        SpriteLoader.drawSafe(ctx, headImg, x, 0, TILE_SIZE, TILE_SIZE);
      }

      // Tuiles du milieu (répétées verticalement jusqu'au sol)
      if (bodyImg) {
        for (let y = TILE_SIZE; y < H - TILE_SIZE; y += TILE_SIZE) {
          SpriteLoader.drawSafe(ctx, bodyImg, x, y, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  /**
   * Dessine la couche "foot" (premier plan, juste au-dessus du sol).
   * À appeler APRÈS draw() mais AVANT de dessiner le sol et les personnages.
   *
   * Le foot défile plus vite que le reste (parallaxe rapide) et utilise
   * plusieurs tuiles en rotation pour varier le décor.
   */
  drawFoot(ctx: CanvasRenderingContext2D): void {
    if (!this.loaded) return;

    const { width: W, height: H } = ctx.canvas;
    const zone = this.zoneManager.getCurrentZone();
    const footTiles = zone.background.foot;

    // La ligne du sol se situe à (hauteur canvas - GROUND_HEIGHT)
    const groundY = H - GROUND_HEIGHT;

    // Les tuiles foot sont dessinées 3× leur taille d'origine pour un rendu imposant
    const FOOT_TILE = TILE_SIZE * 3; // 64 × 3 = 192 px
// c'est là qu'on définit les variables de base

    // Largeur totale du motif (toutes les tuiles foot côte à côte à la nouvelle taille)
    const patternWidth = FOOT_TILE * footTiles.length;

    // Décalage rapide (plus vite que le fond)
    const offsetX = -(this.scrollOffset * FOOT_SCROLL_SPEED) % patternWidth;

    for (let x = offsetX - patternWidth; x < W + patternWidth; x += FOOT_TILE) {
      // Quelle tuile du motif utiliser à cette position ?
      const tileIndex = Math.floor(Math.abs((x - offsetX) / FOOT_TILE)) % footTiles.length;
      const path = footTiles[tileIndex] ?? '';
      const img = this.tileImages.get(path);

      if (img) {
        // La tuile est posée juste au-dessus du sol (son bas touche la ligne de sol)
        SpriteLoader.drawSafe(ctx, img, x, groundY - FOOT_TILE, FOOT_TILE, FOOT_TILE);
      }
    }
  }
}
