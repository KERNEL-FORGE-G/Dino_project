

import { WeatherData, WeatherParticle } from './types';

export class WeatherSystem {

  
  private data: WeatherData | null = null;
  private lastFetchTime: number = 0;
  private readonly REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  
  public isNight: boolean = false;
  private manualNight: boolean = false;          // L'utilisateur a forcé la nuit/jour
  private manualWeatherIndex: number = -1;       // -1 = météo réelle, sinon index du cycle

  // Cycle des codes météo pour le bouton ☁️
  private readonly CYCLE_CODES = [0, 3, 45, 61, 71, 95];

  
  private particles: WeatherParticle[] = [];
  private readonly MAX_PARTICLES = 100;

  

  /**
   * Récupère la météo depuis l'API open-meteo.com.
   * Respecte un délai minimum entre les requêtes pour ne pas spammer l'API.
   */
  async fetchWeather(): Promise<void> {
    // Ne pas re-fetcher si on vient de le faire récemment
    if (this.data && Date.now() - this.lastFetchTime < this.REFRESH_INTERVAL_MS) return;

    // Si l'utilisateur a tout mis en manuel, pas besoin de fetch
    if (this.manualWeatherIndex !== -1 && this.manualNight) return;

    try {
      // Étape 1 : Obtenir les coordonnées GPS (on utilise Paris par défaut)
      let lat = 48.8566, lon = 2.3522;

// cette zone nous sert à gérer les trucs importants
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {
          // Permission refusée ou timeout → on garde Paris
        }
      }

      // Étape 2 : Appel API météo
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const response = await fetch(url);
      const json = await response.json();
      const w = json.current_weather;

      // Étape 3 : Mettre à jour uniquement si pas en mode météo manuel
      if (this.manualWeatherIndex === -1) {
        this.data = this.buildWeatherData(w.weathercode, w.temperature);
      }

      // Étape 4 : Nuit/Jour selon l'API (sauf si forcé manuellement)
      if (!this.manualNight) {
        this.isNight = (w.is_day === 0);
      }

      this.lastFetchTime = Date.now();

    } catch {
      // En cas d'erreur réseau : météo ensoleillée par défaut
      if (!this.data) {
        this.data = this.buildWeatherData(0, 20);
      }
    }
  }

  

// ici on fait la magie pour que ça bouge
  /** Bascule entre le mode jour et le mode nuit */
  toggleTime(): void {
    this.isNight = !this.isNight;
    this.manualNight = true;
  }

  /** Fait défiler les différentes météos disponibles */
  cycleWeather(): void {
    this.manualWeatherIndex = (this.manualWeatherIndex + 1) % this.CYCLE_CODES.length;
    const code = this.CYCLE_CODES[this.manualWeatherIndex]!;
    const temp = this.data?.temperature ?? 20;
    this.data = this.buildWeatherData(code, temp);
  }

  

  /**
   * Met à jour la position des particules météo (pluie/neige).
   * Appelé à chaque frame du jeu.
   */
  updateParticles(canvasWidth: number, canvasHeight: number): void {
    if (!this.data) return;

    const isRaining = this.isRainCode(this.data.weatherCode);
    const isSnowing = this.isSnowCode(this.data.weatherCode);
    const isStorming = this.isStormCode(this.data.weatherCode);

    // Ajouter des particules si conditions météo actives
    if ((isRaining || isSnowing || isStorming) && this.particles.length < this.MAX_PARTICLES) {
      this.particles.push({
        x: Math.random() * canvasWidth,
        y: -10,
        speed: isSnowing ? 2 + Math.random() * 2 : 10 + Math.random() * 5,
        length: isSnowing ? 5 : 15,
      });
    }

    // Faire descendre chaque particule
    for (const p of this.particles) {
      p.y += p.speed;
// c'est là qu'on définit les variables de base
      // Quand elle sort par le bas, la faire réapparaître en haut
      if (p.y > canvasHeight) {
        p.y = -10;
        p.x = Math.random() * canvasWidth;
      }
    }
  }

  

  /**
   * Dessine tous les effets météo sur le canvas.
   * À appeler APRÈS avoir dessiné le décor et les personnages.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.data) return;
    const { weatherCode } = this.data;

    // 1. Voile de brouillard (semi-transparent)
    if (this.isFogCode(weatherCode)) {
      ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // 2. Voile de nuit (bleu sombre)
    if (this.isNight) {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.4)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // 3. Particules de pluie ou de neige
    const isSnowing = this.isSnowCode(weatherCode);
    ctx.strokeStyle = isSnowing ? '#FFFFFF' : '#AACCFF';
    ctx.lineWidth = isSnowing ? 2 : 1;

    for (const p of this.particles) {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // La pluie est inclinée, la neige tombe droit
      ctx.lineTo(p.x - (isSnowing ? 0 : 2), p.y + p.length);
// petit bout de code pour que tout fonctionne bien
      ctx.stroke();
    }

    // 4. Éclairs aléatoires pendant les orages
    if (this.isStormCode(weatherCode) && Math.random() < 0.01) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  /**
   * Dessine le panneau d'information météo (température + icône).
   * Affiché en bas à gauche du canvas pendant le jeu.
   */
  drawInfoPanel(ctx: CanvasRenderingContext2D, scaleFactor: number): void {
    if (!this.data) return;

    const x = 20 * scaleFactor;
    const y = ctx.canvas.height - 80 * scaleFactor;

    // Fond semi-transparent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x - 5, y - 5, 120 * scaleFactor, 60 * scaleFactor);

    // Température + icône
    ctx.fillStyle = '#FFF';
    ctx.font = `bold ${14 * scaleFactor}px Arial`;
    ctx.fillText(`${this.data.icon} ${this.data.temperature}°C`, x, y + 20 * scaleFactor);

    // Description
    ctx.font = `${11 * scaleFactor}px Arial`;
    ctx.fillStyle = '#DDD';
    ctx.fillText(this.data.description, x, y + 40 * scaleFactor);
  }

  

  getData(): WeatherData | null { return this.data; }

  
// j'espère que cette partie ne va pas bugger

  /** Construit un objet WeatherData à partir d'un code WMO et d'une température */
  private buildWeatherData(code: number, temp: number): WeatherData {
    return {
      temperature: Math.round(temp),
      weatherCode: code,
      description: this.codeToDescription(code),
      icon: this.codeToIcon(code),
    };
  }

  // Groupes de codes WMO pour chaque type de précipitation
  private isRainCode(c: number)  { return [51,53,55,61,63,65,80,81,82].includes(c); }
  private isSnowCode(c: number)  { return [71,73,75,77,85,86].includes(c); }
  private isStormCode(c: number) { return [95,96,99].includes(c); }
  private isFogCode(c: number)   { return [45,48].includes(c); }

  private codeToIcon(code: number): string {
    if (code === 0)    return '☀️';
    if (code <= 3)     return '⛅';
    if (code <= 48)    return '🌫️';
    if (code <= 65)    return '🌧️';
    if (code <= 75)    return '❄️';
    if (code <= 99)    return '⛈️';
    return '🌤️';
  }

  private codeToDescription(code: number): string {
    const map: Record<number, string> = {
      0: 'Ensoleillé',      1: 'Peu nuageux',      2: 'Partiellement nuageux',
      3: 'Nuageux',         45: 'Brouillard',       48: 'Brouillard givrant',
      51: 'Bruine légère',  53: 'Bruine',           55: 'Bruine dense',
      61: 'Pluie légère',   63: 'Pluie',            65: 'Pluie forte',
      71: 'Neige légère',   73: 'Neige',            75: 'Neige forte',
      80: 'Averses',        81: 'Averses modérées', 82: 'Averses fortes',
      95: 'Orage',          96: 'Orage + grêle',    99: 'Orage violent',
    };
    return map[code] ?? 'Inconnu';
  }
}
