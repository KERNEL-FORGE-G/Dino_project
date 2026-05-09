
export class SpriteLoader {
  /** Cache global : une image chargée une fois est réutilisée partout */
  private static cache: Map<string, HTMLImageElement> = new Map();

  /**
   * Charge une image depuis un chemin et retourne l'élément HTMLImageElement.
   * Si l'image a déjà été chargée, elle est retournée immédiatement depuis le cache.
   *
   * @param path - Chemin relatif au dossier public, ex: "assets/enemies/ladybug.png"
   * @returns L'image chargée (ou une image vide si le fichier est introuvable)
   */
  static async load(path: string): Promise<HTMLImageElement> {
    // 1. Si déjà en cache, on retourne directement
    if (SpriteLoader.cache.has(path)) {
      return SpriteLoader.cache.get(path)!;
    }

    // 2. Sinon, on crée une nouvelle image et on attend son chargement
    return new Promise((resolve) => {
      const img = new Image();
      img.src = path;

      img.onload = () => {
        SpriteLoader.cache.set(path, img); // Mise en cache
        resolve(img);
      };

      img.onerror = () => {
        // Si l'image n'existe pas, on résout quand même avec l'image vide
        // pour ne pas bloquer le jeu
        SpriteLoader.cache.set(path, img);
        resolve(img);
      };
    });
  }

  /**
   * Charge plusieurs images en parallèle (plus rapide que l'une après l'autre).
   *
// cette zone nous sert à gérer les trucs importants
   * @param paths - Tableau de chemins d'images
   * @returns Tableau d'images dans le même ordre
   */
  static async loadMany(paths: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(paths.map(path => SpriteLoader.load(path)));
  }

  /**
   * Dessine une image sur le canvas de façon sécurisée.
   * Vérifie que l'image est bien chargée avant de la dessiner.
   */
  static drawSafe(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number,
    width: number, height: number
  ): void {
    // Désactive l'antialiasing pour un rendu pixel-art net
    ctx.imageSmoothingEnabled = false;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, Math.floor(x), Math.floor(y), width, height);
    }

    ctx.imageSmoothingEnabled = true;
  }
}
