import { Particle } from './objects/Particle';
import { WeatherManager } from './managers/WeatherManager';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Particle[] = [];
    private weatherManager: WeatherManager;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.weatherManager = new WeatherManager();
        this.setup();
    }

    async setup() {
        await this.weatherManager.updateWeather();
        const info = this.weatherManager.getWeatherInfo();

        this.refreshParticles(info.type);
        
        // 3. Lancer la boucle
        this.loop();
    }

    private refreshParticles(type: string) {
        this.particles = []; // Vider le tableau
        if (type === 'Rain' || type === 'Snow') {
            const count = type === 'Rain' ? 100 : 50;
            const wind = this.weatherManager.getWeatherInfo().wind;
            for (let i = 0; i < count; i++) {
                this.particles.push(new Particle(this.canvas.width, this.canvas.height, type as "Rain" | "Snow", wind));
            }
        }
    }

    private update() {
        const info = this.weatherManager.getWeatherInfo();
        
        // Met a jour chaque particule avec le vent 
        this.particles.forEach(p => {
            p.update(this.canvas.width, this.canvas.height);
        });
    }

    private draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les particules
        this.particles.forEach(p => p.draw(this.ctx));
    }

    private loop = () => {
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }
}