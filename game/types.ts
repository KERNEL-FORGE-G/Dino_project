

/**
 * Tout objet pouvant être mis à jour et dessiné à l'écran
 * (joueur, ennemis, plateformes...) doit implémenter cette interface.
 */
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  update(speed?: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
}

/**
 * Données météo récupérées depuis l'API open-meteo.com
 */
export interface WeatherData {
  temperature: number;   // Ex: 18 (°C)
  weatherCode: number;   // Code WMO (0 = soleil, 61 = pluie, 71 = neige...)
  description: string;  // Ex: "Pluie légère"
  icon: string;         // Emoji météo : ☀️ 🌧️ ❄️
}

/**
 * Un avatar est un personnage jouable.
 * Chaque avatar possède un ensemble de sprites (images) pour chaque animation.
 */
export interface AvatarDefinition {
  id: string;       // Identifiant unique, ex: "adventurer"
  name: string;     // Nom affiché à l'écran, ex: "Aventurier"
  category: 'character' | 'adventurer' | 'female' | 'soldier' | 'robot';
  folder: string;   // Dossier où se trouvent les sprites, ex: "assets/personnages/Adventurer"
  sprites: {
    idle: string;     // Nom du fichier immobile, ex: "adventurer_idle.png"
    walk: string[];   // Noms des frames de marche, ex: ["walk1.png", "walk2.png"]
    jump: string;     // Sprite de saut
    hurt: string;     // Sprite blessé
    duck: string;     // Sprite accroupi
// cette zone nous sert à gérer les trucs importants
  };
}

/**
 * Une zone est un "niveau" visuel du jeu.
 * Les 3 zones (Blanche, Verte, Orange) changent le décor et les ennemis disponibles.
 */
export interface ZoneDefinition {
  id: number;
  name: string;
  /**
   * Les tuiles de fond sont divisées en 3 couches pour créer de la profondeur :
   * - head : la partie haute (ciel, bâtiments lointains)
   * - body : la partie centrale répétée
   * - foot : le premier plan (herbe, décorations proches du sol)
   */
  background: {
    head: string[];   // Chemins des images de la couche haute
    body: string[];   // Chemins des images de la couche centrale
    foot: string[];   // Chemins du premier plan (scrollé plus vite)
  };
  platforms: [string, string, string]; // [gauche, milieu, droite] de la plateforme
  obstacles: string[];  // Liste des ennemis disponibles dans cette zone
  groundTexture: string; // Image du sol
  scoreToUnlock: number; // Score nécessaire pour entrer dans cette zone
}

/**
 * Types d'ennemis au sol reconnus par Enemy.ts et Game.ts
 *
 * Animés (sauteurs) : ladybug, souris, blue, green
 * Animés (marcheurs): zombie, barnacle, tr, tu, ty
 * Statiques         : cars (voitures, barrières, props)
 * Spécial           : platform (on peut marcher dessus, pas de dégâts)
 *
 * Note : 'ufo' / OVNI est géré par Bird.ts (ennemi aérien), pas ici.
 */
export type GroundEnemyType =
  | 'ladybug' | 'souris' | 'zombie' | 'barnacle'
  | 'blue' | 'green' | 'tr' | 'tu' | 'ty'
// ici on fait la magie pour que ça bouge
  | 'cars' | 'platform';

/**
 * Une particule météo (goutte de pluie, flocon de neige)
 */
export interface WeatherParticle {
  x: number;
  y: number;
  speed: number;   // Vitesse de chute (px/frame)
  length: number;  // Longueur de la traîne
}
