import { WeatherType } from "../types";

export interface WeatherData {
    isRaining: boolean;
    isNight: boolean;
    city: string;
    temperature: number;
    type: WeatherType;
}
export class WeatherManager {
    private apiUrl = "https://api.open-meteo.com/v1/forecast";

    private lat = 48.8566;
    private lon = 2.3522;
    private city = "Paris";// on prend paris comme de reference de depart 

    private currentWeather: WeatherType = "Clear";

    constructor() {
        this.initGeolocation();
    }

    getWeatherType(): WeatherType {
        return this.currentWeather;
    }
    private initGeolocation() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.lat = position.coords.latitude;
                this.lon = position.coords.longitude;
                this.city = "Ma position";
            });
        }
    }
    async getRealTimeWeather(): Promise<WeatherData> {
        try {
            const response = await fetch(
                `${this.apiUrl}?latitude=${this.lat}&longitude=${this.lon}&current=weather_code,is_day,temperature_2m`
            );
            const data = await response.json();

            const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];// pour les temperature pluvieuses
            const currentWeatherCode = data.current.weather_code;

            const isRaining = rainCodes.includes(currentWeatherCode);
            const isNight = data.current.is_day === 0;
            
            if (isRaining) {
                this.currentWeather = "Rain";
            } else if (currentWeatherCode >= 71 && currentWeatherCode <= 77) {
                this.currentWeather = "Snow";
            } else {
                this.currentWeather = "Clear";
            }

            return {
                isRaining: isRaining,
                isNight: isNight,
                city: this.city,
                temperature: data.current.temperature_2m,
                type: this.currentWeather
            };
        } catch (error) {
            console.error("Erreur météo:", error);
            // Backup si l'API échoue : on se base sur l'heure locale
            const hour = new Date().getHours();
            return {
                isRaining: false,
                isNight: hour < 6 || hour > 20,
                city: "Local (Offline)",
                temperature: 20
            };
        }
    }
}

