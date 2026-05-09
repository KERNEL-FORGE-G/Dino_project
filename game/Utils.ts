import { SpriteLoader } from './SpriteLoader';

export interface WeatherData {
    temperature: number;
    weatherCode: number;
    description: string;
    icon: string;
    city: string;
    wind: number;
}

export class AudioManager {
    private sounds: Map<string, HTMLAudioElement> = new Map();
    private ambientPlaylist: HTMLAudioElement[] = [];
    private currentAmbientIndex: number = -1;
    private _isMuted = false;
    private soundsAvailable = false;

    async loadSounds(): Promise<void> {
        try {
            const soundFiles = [
                { name: 'jump',      path: 'assets/Sounds/sfx_jump.ogg' },
                { name: 'jump-high', path: 'assets/Sounds/sfx_jump-high.ogg' },
                { name: 'collision', path: 'assets/Sounds/sfx_hurt.ogg' },
                { name: 'death',     path: 'assets/Sounds/death.m4a' },
                { name: 'coin',      path: 'assets/Sounds/sfx_coin.ogg' },
                { name: 'gem',       path: 'assets/Sounds/sfx_gem.ogg' },
                { name: 'select',    path: 'assets/Sounds/sfx_select.ogg' },
                { name: 'bump',      path: 'assets/Sounds/sfx_bump.ogg' },
                { name: 'magic',     path: 'assets/Sounds/sfx_magic.ogg' },
                { name: 'throw',     path: 'assets/Sounds/sfx_throw.ogg' },
                { name: 'disappear', path: 'assets/Sounds/sfx_disappear.ogg' }
            ];

            const zoneFiles = [
                'assets/Sounds/zone song/white_zone.m4a',
                'assets/Sounds/zone song/green_zone.m4a',
                'assets/Sounds/zone song/orange_zone.m4a'
            ];
            
            let loadedCount = 0;

            // Chargement des bruitages
            for (const file of soundFiles) {
                try {
                    const audio = new Audio(file.path);
                    audio.volume = 0.3;
                    this.sounds.set(file.name, audio);
                    loadedCount++;
                } catch (_e) { /* ignore */ }
            }

            // Chargement de la playlist d'ambiance
            for (const path of zoneFiles) {
                try {
                    const audio = new Audio(path);
                    audio.loop = false; // On ne boucle pas, on veut l'enchaînement
                    audio.volume = 0.4;
                    
                    // Quand la musique finit, on lance la suivante
                    audio.addEventListener('ended', () => {
                        this.playNextAmbient();
                    });

                    this.ambientPlaylist.push(audio);
                    loadedCount++;
                } catch (_e) { /* ignore */ }
            }

            this.soundsAvailable = loadedCount > 0;
        } catch (_e) {
            this.soundsAvailable = false;
        }
    }

    private play(name: string, volume = 0.3): void {
        if (this.soundsAvailable && !this._isMuted) {
            const sound = this.sounds.get(name);
            if (sound) {
                sound.currentTime = 0;
                sound.volume = volume;
                sound.play().catch(() => {});
            }
        }
    }

    startAmbientCycle(): void {
        if (!this.soundsAvailable || this.ambientPlaylist.length === 0) return;
        this.stopAllMusic();
        this.currentAmbientIndex = 0;
        this.playCurrentAmbient();
    }

    private playNextAmbient(): void {
        this.currentAmbientIndex = (this.currentAmbientIndex + 1) % this.ambientPlaylist.length;
        this.playCurrentAmbient();
    }

    private playCurrentAmbient(): void {
        const music = this.ambientPlaylist[this.currentAmbientIndex];
        if (music) {
            music.currentTime = 0;
            if (!this._isMuted) {
                music.play().catch(() => {});
            }
        }
    }

    stopAllMusic(): void {
        this.ambientPlaylist.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
    }

    playJump(): void      { this.play('jump', 0.2); }
    playJumpHigh(): void  { this.play('jump-high', 0.2); }
    playCollision(): void { this.play('collision', 0.5); }
    playDeath(): void     { this.play('death', 0.6); }
    playCoin(): void      { this.play('coin', 0.3); }
    playGem(): void       { this.play('gem', 0.3); }
    playSelect(): void    { this.play('select', 0.3); }
    playBump(): void      { this.play('bump', 0.3); }
    playMagic(): void     { this.play('magic', 0.3); }
    playThrow(): void     { this.play('throw', 0.3); }
    playDisappear(): void { this.play('disappear', 0.3); }

    toggleMute(): void {
        this._isMuted = !this._isMuted;
        const currentMusic = this.ambientPlaylist[this.currentAmbientIndex];
        if (!currentMusic) return;

        if (this._isMuted) {
            currentMusic.pause();
        } else {
            currentMusic.play().catch(() => {});
        }
    }

    get isMuted(): boolean {
        return this._isMuted;
    }
}


export class NumberRenderer {
    private images: Map<string, HTMLImageElement> = new Map();
    private loaded = false;

    constructor() {
        this.loadImages();
    }

    private async loadImages(): Promise<void> {
        const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '%', 'X'];
        for (const char of chars) {
            const img = await SpriteLoader.load(`assets/map/numbers/${encodeURIComponent(char)}.png`);
            this.images.set(char, img);
        }
        this.loaded = true;
    }

    draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number = 1): void {
        if (!this.loaded) return;

        let currentX = x;
        for (const char of text.toUpperCase()) {
            const img = this.images.get(char);
            if (img) {
                const drawWidth = (img.naturalWidth || 32) * scale;
                const drawHeight = (img.naturalHeight || 32) * scale;
                SpriteLoader.drawSafe(ctx, img, currentX, y, drawWidth, drawHeight);
                currentX += drawWidth + 2 * scale;
            }
        }
// c'est là qu'on définit les variables de base
    }
}

export class WeatherManager {
    private weatherData: WeatherData | null = null;
    private lastUpdate = 0;
    private readonly UPDATE_INTERVAL = 10 * 60 * 1000;
    public isNight = false;
    private manualWeatherIndex = -1;
    private manualTimeOverride = false;
    private readonly weatherCodes = [0, 3, 45, 61, 71, 95];
    private city = "Paris";

    async fetchWeather(): Promise<void> {
        if (this.manualWeatherIndex !== -1 && this.manualTimeOverride) return;

        const now = Date.now();
        if (now - this.lastUpdate < this.UPDATE_INTERVAL && this.weatherData) return;

        try {
            let lat = 48.8566;
            let lon = 2.3522;

            if ("geolocation" in navigator) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    lat = position.coords.latitude;
                    lon = position.coords.longitude;
                    this.city = "Ma position";
                } catch (_e) {
                    this.city = "Paris";
                }
            }

            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,is_day,temperature_2m,wind_speed_10m`);
            const data = await response.json();
            const current = data.current;

            if (this.manualWeatherIndex === -1) {
                this.weatherData = {
                    temperature: Math.round(current.temperature_2m),
                    weatherCode: current.weather_code,
                    description: this.getWeatherDescription(current.weather_code),
                    icon: this.getWeatherIcon(current.weather_code),
                    city: this.city,
                    wind: current.wind_speed_10m || 5
                };
            }

            if (!this.manualTimeOverride) {
                this.isNight = current.is_day === 0;
            }

            this.lastUpdate = now;
        } catch (_e) {
            if (!this.weatherData) {
                this.weatherData = {
                    temperature: 20,
                    weatherCode: 0,
                    description: 'Ensoleillé',
                    icon: '☀️',
                    city: 'Local (Offline)',
                    wind: 5
                };
            }
        }
    }

    toggleTime(): void {
        this.isNight = !this.isNight;
        this.manualTimeOverride = true;
    }
cycleWeather(): void {
    this.manualWeatherIndex = (this.manualWeatherIndex + 1) % this.weatherCodes.length;
    const code = this.weatherCodes[this.manualWeatherIndex] as number;
    this.weatherData = {
        temperature: this.weatherData?.temperature || 20,
        weatherCode: code,
        description: this.getWeatherDescription(code),
        icon: this.getWeatherIcon(code),
        city: this.city,
        wind: this.weatherData?.wind || 5
    };
}

    private getWeatherDescription(code: number): string {
// j'espère que cette partie ne va pas bugger
        const descriptions: { [key: number]: string } = {
            0: 'Ensoleillé', 1: 'Principalement clair', 2: 'Partiellement nuageux',
            3: 'Nuageux', 45: 'Brouillard', 48: 'Brouillard givrant',
            51: 'Bruine légère', 53: 'Bruine modérée', 55: 'Bruine dense',
            61: 'Pluie légère', 63: 'Pluie modérée', 65: 'Pluie forte',
            71: 'Neige légère', 73: 'Neige modérée', 75: 'Neige forte',
            80: 'Averses légères', 81: 'Averses modérées', 82: 'Averses violentes',
            95: 'Orage', 96: 'Orage avec grêle légère', 99: 'Orage avec grêle forte'
        };
        return descriptions[code] || 'Inconnu';
    }

    private getWeatherIcon(code: number): string {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫️';
        if (code <= 65) return '🌧️';
        if (code <= 75) return '❄️';
        if (code <= 99) return '⛈️';
        return '🌤️';
    }

    getWeatherData(): WeatherData | null {
        return this.weatherData;
    }

    getBackgroundColor(): string {
        if (this.isNight) return '#1a1a2e';
        if (!this.weatherData) return '#FFFACD';
        const code = this.weatherData.weatherCode;
        if (code === 0) return '#FFFACD';
        if (code <= 3) return '#FFDAB9';
        if (code <= 48) return '#F5F5DC';
        if (code <= 65) return '#8FBC8F';
        if (code <= 75) return '#E8F4F8';
        if (code <= 99) return '#8B4513';
        return '#FFFACD';
    }
}
