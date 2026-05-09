
export class AudioSystem {

  private jumpSound:      HTMLAudioElement | null = null;
  private collisionSound: HTMLAudioElement | null = null;
  private muted: boolean = false;
  private ready: boolean = false;  // true si au moins un son est chargé

  /**
   * Charge les fichiers audio. À appeler une fois au démarrage.
   * (async car on doit vérifier l'existence des fichiers)
   */
  async init(): Promise<void> {
    const soundFiles = [
      { key: 'jump',      path: 'assets/Sounds/sfx_jump.ogg' },
      { key: 'collision', path: 'assets/Sounds/sfx_hurt.ogg' },
    ];

    let loaded = 0;

    for (const { key, path } of soundFiles) {
      try {
        // Vérifier que le fichier existe avant de créer l'Audio
        const res = await fetch(path, { method: 'HEAD' });
        if (!res.ok) continue;

        const audio = new Audio(path);

        if (key === 'jump') {
          audio.volume = 0.3;
          this.jumpSound = audio;
        } else if (key === 'collision') {
          audio.volume = 0.6;
          this.collisionSound = audio;
        }

        loaded++;
      } catch {
        // Fichier inaccessible, on ignore
      }
// cette zone nous sert à gérer les trucs importants
    }

    this.ready = loaded > 0;
  }

  /** Joue le son de saut */
  playJump(): void {
    if (!this.ready || this.muted || !this.jumpSound) return;
    this.jumpSound.currentTime = 0;
    this.jumpSound.play().catch(() => {});
  }

  /** Joue le son de collision */
  playCollision(): void {
    if (!this.ready || this.muted || !this.collisionSound) return;
    this.collisionSound.currentTime = 0;
    this.collisionSound.play().catch(() => {});
  }

  /** Active / désactive le son (touche M en jeu) */
  toggleMute(): void {
    this.muted = !this.muted;
  }

  isMuted(): boolean { return this.muted; }
}
