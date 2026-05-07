export class AudioManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    const files: Record<string, string> = {
      jump:       "assets/Sounds/sfx_jump.ogg",
      jumpHigh:   "assets/Sounds/sfx_jump-high.ogg",
      hurt:       "assets/Sounds/sfx_hurt.ogg",
      die:        "assets/Sounds/sfx_disappear.ogg",
      score:      "assets/Sounds/sfx_coin.ogg",
      select:     "assets/Sounds/sfx_select.ogg",
      bump:       "assets/Sounds/sfx_bump.ogg",
      gem:        "assets/Sounds/sfx_gem.ogg",
      magic:      "assets/Sounds/sfx_magic.ogg",
      throw:      "assets/Sounds/sfx_throw.ogg",
    };

    for (const [key, src] of Object.entries(files)) {
      const audio = new Audio(src);
      audio.preload = "auto";
      this.sounds[key] = audio;
    }
  }

  play(event: "jump" | "jumpHigh" | "hurt" | "die" | "score" | "select" | "bump" | "gem" | "magic" | "throw"): void {
    const sound = this.sounds[event];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}