

import { ZoneDefinition } from './types';
import { ZONE_1_SCORE_THRESHOLD, ZONE_2_SCORE_THRESHOLD } from './constants';

export class ZoneManager {

  
  private static instance: ZoneManager;

  static getInstance(): ZoneManager {
    if (!ZoneManager.instance) {
      ZoneManager.instance = new ZoneManager();
    }
    return ZoneManager.instance;
  }

  
  private zones: ZoneDefinition[] = [];
  private currentZoneIndex: number = 0;

  
  constructor() {
    this.defineZones();
  }

  /**
   * Définition des 3 zones du jeu.
   *
   * STRUCTURE DE LA LISTE obstacles :
   *  Chaque entrée est un type d'ennemi reconnu par Game.ts / spawnGroundObstacle().
   *  Plus un type est présent plusieurs fois, plus il a de chances d'apparaître.
   *
   *  Types disponibles :
   *    Au sol animés  : 'ladybug', 'souris', 'zombie', 'barnacle',
   *                     'blue', 'green', 'tr', 'tu', 'ty'
   *    Statiques/props: 'barrier', 'light', 'sign_red', 'sign_blue'
   *    Blocs          : 'block' (tombant du ciel)
   *    Véhicules      : 'sedan', 'truck', 'bus', 'police', 'firetruck',
   *                     'ambulance', 'taxi', 'van', 'bus_school'
// cette zone nous sert à gérer les trucs importants
   */
  private defineZones(): void {

    // ── ZONE 1 : Blanche — Village ──────────────────────────────────────────
    // Intro douce : ennemis petits et prévisibles
    this.zones.push({
      id: 0,
      name: "Zone Blanche",
      background: {
        head: ['assets/map/zones/white_head.png'],
        body: ['assets/map/zones/white_body.png'],
        foot: [
          'assets/map/zones/white_foot1.png',
          'assets/map/zones/white_foot2.png',
          'assets/map/zones/white_foot3.png',
          'assets/map/zones/white_foot4.png',
        ],
      },
      platforms: [
        'assets/map/plateformes/white_p1.png',
        'assets/map/plateformes/white_p2.png',
        'assets/map/plateformes/white_p3.png',
      ],
      obstacles: [
        'ladybug', 'ladybug',            // Coccinelle — très présente en zone 1
        'souris', 'souris',              // Souris — saut imprévisible
        'blue', 'green',                 // Petites créatures colorées
        'barrier',                       // Barrière statique
        'sign_red', 'sign_blue',         // Panneaux (décor / obstacle)
      ],
      groundTexture: 'assets/map/sol/white_zone.svg',
      scoreToUnlock: 0,
    });

    // ── ZONE 2 : Verte — Forêt ──────────────────────────────────────────────
    // Difficulté modérée : zombies, barnacles, blocs tombants
    this.zones.push({
      id: 1,
      name: "Zone Verte",
      background: {
// ici on fait la magie pour que ça bouge
        head: ['assets/map/zones/green_head.png'],
        body: ['assets/map/zones/green_body.png'],
        foot: [
          'assets/map/zones/green_foot1.png',
          'assets/map/zones/green_foot2.png',
        ],
      },
      platforms: [
        'assets/map/plateformes/green_p1.png',
        'assets/map/plateformes/green_p2.png',
        'assets/map/plateformes/green_p3.png',
      ],
      obstacles: [
        'ladybug', 'souris',             // Toujours présents
        'zombie', 'zombie',              // Zombie — marche lentement (plus grand)
        'barnacle',                      // Barnacle — ennemi attaquant
        'blue', 'green',                 // Petites créatures
        'tr', 'tu',                      // Nouvelles créatures
        'barrier',
        'block',                         // Bloc tombant du ciel
        'light',                         // Lampadaire (obstacle)
      ],
      groundTexture: 'assets/map/sol/green_zone.svg',
      scoreToUnlock: ZONE_1_SCORE_THRESHOLD,
    });

    // ── ZONE 3 : Orange — Désert ─────────────────────────────────────────────
    // Zone difficile : voitures rapides, tous les types d'ennemis
    this.zones.push({
      id: 2,
      name: "Zone Orange",
      background: {
        head: ['assets/map/zones/orange_head.png'],
        body: ['assets/map/zones/orange_body.png'],
        foot: [
          'assets/map/zones/orange_foot1.png',
          'assets/map/zones/orange_foot2.png',
        ],
      },
      platforms: [
// c'est là qu'on définit les variables de base
        'assets/map/plateformes/orange_p1.png',
        'assets/map/plateformes/orange_p2.png',
        'assets/map/plateformes/orange_p3.png',
      ],
      obstacles: [
        'ladybug', 'souris',
        'zombie',
        'barnacle',
        'tr', 'tu', 'ty',               // Toutes les créatures colorées
        'sedan', 'sedan',               // Voiture standard — fréquente
        'police',                       // Voiture de police
        'taxi',                         // Taxi
        'ambulance',                    // Ambulance
        'firetruck',                    // Camion de pompiers
        'truck',                        // Camion
        'bus',                          // Bus
        'van',                          // Camionnette
        'barrier',
        'block', 'block',               // Blocs tombants — plus fréquents
        'sign_street',                  // Panneau de rue
      ],
      groundTexture: 'assets/map/sol/orange_zone.svg',
      scoreToUnlock: ZONE_2_SCORE_THRESHOLD,
    });
  }

  

  /** Retourne la zone actuellement active */
  getCurrentZone(): ZoneDefinition {
    return this.zones[this.currentZoneIndex]!;
  }

  /** Retourne la liste des obstacles disponibles dans la zone actuelle */
  getAvailableObstacles(): string[] {
    return this.getCurrentZone().obstacles;
  }

  /**
   * Met à jour le score et change de zone si le seuil est atteint.
   * On passe à la zone suivante de manière infinie (boucle).
   * @returns true si on vient de changer de zone
   */
  updateScore(score: number): boolean {
    const zoneLength = this.zones.length;
    if (zoneLength === 0) return false;

    // Calcul du seuil de la zone suivante
    // On utilise un cycle de 600 points (200 + 200 + 200) pour boucler
    const cycleScore = 600;
    const currentCycle = Math.floor(score / cycleScore);
    const scoreInCycle = score % cycleScore;

    let targetZoneIndex = 0;
    if (scoreInCycle >= ZONE_2_SCORE_THRESHOLD) {
      targetZoneIndex = 2; // Zone Orange
    } else if (scoreInCycle >= ZONE_1_SCORE_THRESHOLD) {
      targetZoneIndex = 1; // Zone Verte
    } else {
      targetZoneIndex = 0; // Zone Blanche
    }

    if (this.currentZoneIndex !== targetZoneIndex) {
      this.currentZoneIndex = targetZoneIndex;
      return true;
    }

    return false;
  }

  /** Remet le jeu à la zone 1 (appelé quand le joueur recommence) */
  reset(): void {
    this.currentZoneIndex = 0;
  }
}
