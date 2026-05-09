

/** Définition complète d'un avatar jouable */
export interface AvatarOption {
  id: string;       // Identifiant unique, ex: "adventurer"
  name: string;     // Nom affiché, ex: "Aventurier"
  category: 'dino' | 'character' | 'adventurer' | 'female' | 'soldier' | 'robot';
  path: string;     // Chemin vers le dossier des sprites, ex: "assets/personnages/Adventurer"
  sprites: {
    idle:  string;    // Nom du fichier immobile, ex: "adventurer_idle.png"
    walk:  string[];  // Noms des frames de marche, ex: ["walk1.png", "walk2.png"]
    jump:  string;    // Sprite de saut
    hurt:  string;    // Sprite blessé
    duck:  string;    // Sprite accroupi
  };
}

export class AvatarManager {

  
  private static instance: AvatarManager;

  static getInstance(): AvatarManager {
    if (!AvatarManager.instance) {
      AvatarManager.instance = new AvatarManager();
    }
    return AvatarManager.instance;
  }

  
  private avatars: AvatarOption[] = [];
  private selectedId = 'dino'; // Avatar par défaut

  
  private constructor() {
    this.registerAllAvatars();
  }

  /**
   * Enregistre tous les avatars disponibles.
// cette zone nous sert à gérer les trucs importants
   *
   * Pour ajouter un nouvel avatar :
   *  1. Placer ses sprites dans artifacts/dyno/public/assets/personnages/{NomDossier}/
   *  2. Ajouter un bloc ci-dessous avec les noms de fichiers corrects
   */
  private registerAllAvatars(): void {

    // ── Dino (avatar par défaut) ────────────────────────────────────────────
    this.avatars.push({
      id:       'dino',
      name:     'Dino',
      category: 'dino',
      path:     'assets/personnages/Dino',
      sprites: {
        idle: 'dino_idle.png',
        walk: [
          'dino_run_1.png', 'dino_run_2.png', 'dino_run_3.png',
          'dino_run_4.png', 'dino_run_5.png', 'dino_run_6.png',
        ],
        jump: 'dino_jump.png',
        hurt: 'dino_dead.png',
        duck: 'dino_duck.png',
      },
    });

    // ── Player ─────────────────────────────────────────────────────────────
    this.avatars.push({
      id:       'player',
      name:     'Joueur',
      category: 'character',
      path:     'assets/personnages/Player',
      sprites: {
        idle: 'player_idle.png',
        walk: ['player_walk1.png', 'player_walk2.png'],
        jump: 'player_jump.png',
        hurt: 'player_hurt.png',
        duck: 'player_duck.png',
      },
    });

    // ── Robot Blue ─────────────────────────────────────────────────────────
    this.avatars.push({
      id:       'robot_blue',
      name:     'Robot Bleu',
      category: 'robot',
      path:     'assets/personnages/robot',
      sprites: {
        idle: 'robot_blueDrive1.png',
        walk: ['robot_blueDrive1.png', 'robot_blueDrive2.png'],
        jump: 'robot_blueJump.png',
        hurt: 'robot_blueHurt.png',
        duck: 'robot_blueDrive1.png',
      },
    });

    // ── Character Pink ──────────────────────────────────────────────────────
    this.avatars.push({
      id:       'character_pink',
      name:     'Personnage Rose',
      category: 'character',
      path:     'assets/personnages/Default',
      sprites: {
        idle: 'character_pink_idle.png',
        walk: ['character_pink_walk_a.png', 'character_pink_walk_b.png'],
        jump: 'character_pink_jump.png',
        hurt: 'character_pink_hit.png',
        duck: 'character_pink_duck.png',
      },
    });
  }

  

  /** Retourne tous les avatars disponibles (utilisé par GamePage.tsx) */
  getAvatars(): AvatarOption[] {
    return this.avatars;
  }

  /** Sélectionne un avatar et sauvegarde le choix dans localStorage */
  selectAvatar(id: string): void {
// petit bout de code pour que tout fonctionne bien
    if (this.avatars.find(a => a.id === id)) {
      this.selectedId = id;
      localStorage.setItem('dyno-selected-avatar', id);
    }
  }

  /**
   * Retourne l'avatar actuellement sélectionné.
   * Restaure depuis localStorage si disponible.
   */
  getSelectedAvatar(): AvatarOption {
    const saved = localStorage.getItem('dyno-selected-avatar');
    if (saved) {
      const found = this.avatars.find(a => a.id === saved);
      if (found) {
        this.selectedId = saved;
        return found;
      }
    }
    return this.avatars.find(a => a.id === this.selectedId)
      ?? this.avatars[0]!;
  }
}
