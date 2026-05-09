

// --- PHYSIQUE DU JOUEUR ---
export const GRAVITY       = 0.8;  // Accélération gravitationnelle (px/frame²)
export const JUMP_FORCE    = 14;   // Impulsion de saut (positif = vers le haut ↑)
export const NORMAL_HEIGHT = 44;   // Hauteur du joueur debout (px)
export const DUCK_HEIGHT   = 25;   // Hauteur du joueur accroupi (px)

// --- VITESSE DU JEU ---
export const INITIAL_SPEED    = 6;     // Vitesse de départ (px/frame)
export const SPEED_INCREASE   = 0.003; // Accélération continue (px/frame²) — appliquée chaque frame
export const ZONE_SPEED_BOOST = 2;     // Bonus de vitesse instantané à chaque changement de zone

// --- OBSTACLES ---
export const OBSTACLE_MIN_INTERVAL = 60;   // Minimum frames entre deux obstacles
export const OBSTACLE_MAX_INTERVAL = 80;   // Variation aléatoire
export const PLATFORM_CHANCE       = 0.15; // 15% de chance qu'un obstacle soit une plateforme
export const AIR_ENEMY_CHANCE      = 0.20; // 20% de chance d'un ennemi aérien

// --- DÉCOR ---
export const TILE_SIZE         = 64;  // Taille d'une tuile de fond (px)
export const GROUND_HEIGHT     = 64;  // Hauteur de la bande de sol visible (px)
export const BG_SCROLL_SPEED   = 0.5; // Vitesse du fond lointain (parallaxe lente)
export const FOOT_SCROLL_SPEED = 0.7; // Vitesse du premier plan (parallaxe rapide)

// --- VIE / SANTÉ ---
export const MAX_HEALTH = 6; // Points de vie max (3 cœurs = 6 demi-cœurs)

// --- SCORE ---
export const SCORE_PER_FRAME = 0.1; // Points gagnés par frame

// --- ZONES ---
// Les zones changent tous les 200 points
export const ZONE_1_SCORE_THRESHOLD = 200; // Score pour passer en zone 2
export const ZONE_2_SCORE_THRESHOLD = 400; // Score pour passer en zone 3


//  FONCTION DE CONVERSION : MONDE → CANVAS

//
// cette zone nous sert à gérer les trucs importants
//  Monde  (x, y) : coin BAS-GAUCHE de l'objet, Y croît ↑ vers le haut
//  Canvas (x, y) : coin HAUT-GAUCHE de l'objet, Y croît ↓ vers le bas
//
//  ┌─────────────────── canvas ──────────────────────┐
//  │  (0,0)                              Y vers le bas│
//  │                                                  │
//  │  surface du sol  ←  (canvasH - GROUND_HEIGHT)   │
//  │══════════════════════════════════════════════════│
//  │  bande de sol visible (GROUND_HEIGHT px)         │
//  └──────────────────────────────────────────────────┘
//
//  Formule :
//    surface_sol_canvas = canvasH - GROUND_HEIGHT
//    canvasY_haut_objet = surface_sol_canvas - worldY - objectHeight
//
/**
 * Convertit la coordonnée monde Y (bas de l'objet) en coordonnée canvas Y (haut de l'objet).
 *
 * @param worldY       - Coordonnée monde Y du bas de l'objet (Y=0 = surface du sol)
 * @param objectHeight - Hauteur de l'objet (px)
 * @param canvasHeight - Hauteur totale du canvas (ctx.canvas.height)
 * @returns Coordonnée canvas Y du haut de l'objet (à passer à ctx.drawImage)
 *
 * @example
 *   // Objet posé sur le sol (worldY=0), hauteur 44px, canvas 400px :
 *   worldToCanvasY(0, 44, 400) → 400 - 64 - 0 - 44 = 292
 *   // Le sprite sera dessiné de canvas Y=292 à canvas Y=336 (juste au-dessus du sol)
 */
export function worldToCanvasY(worldY: number, objectHeight: number, canvasHeight: number): number {
  return canvasHeight - GROUND_HEIGHT - worldY - objectHeight;
}
