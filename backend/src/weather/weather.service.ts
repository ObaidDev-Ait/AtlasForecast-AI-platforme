import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WeatherQueryOptions {
  city?: string;
  lat?: number;
  lon?: number;
  units?: string;
  lang?: string;
}

export interface NormalizedWeatherData {
  id?: number;
  name: string;
  city: string;
  country: string;
  coord: { lat: number; lon: number };
  coordinates: { lat: number; lon: number };
  temperature: number;
  feels_like: number;
  temp_min?: number;
  temp_max?: number;
  humidity: number;
  pressure: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  description: string;
  icon: string;
  weather: Array<{ description: string; icon: string; main?: string }>;
  main: any;
  sys: any;
  clouds: number;
  visibility: number;
  timezone: number;
  dt: number;
  units: string;
}

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  local_names?: Record<string, string>;
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cache = new Map<string, { expiresAt: number; data: any }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    const key = this.getApiKey();
    if (!key) {
      this.logger.warn(
        'OPENWEATHER_API_KEY is not configured. Weather API calls will fail until configured.',
      );
    }
  }

  private cleanValue(val: any): string | undefined {
    if (typeof val !== 'string') return undefined;
    let trimmed = val.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      trimmed = trimmed.slice(1, -1).trim();
    }
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private resolveEnv(keys: string[]): string | undefined {
    for (const key of keys) {
      const fromProcess = this.cleanValue(process.env[key]);
      if (fromProcess) return fromProcess;

      const fromConfig = this.cleanValue(this.configService.get<string>(key));
      if (fromConfig) return fromConfig;
    }
    return undefined;
  }

  getApiKey(): string {
    return (
      this.resolveEnv([
        'OPENWEATHER_API_KEY',
        'WEATHER_API_KEY',
        'OPEN_WEATHER_API_KEY',
      ]) || ''
    );
  }

  getBaseUrl(): string {
    return (
      this.resolveEnv(['OPENWEATHER_BASE_URL']) ||
      'https://api.openweathermap.org'
    );
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setInCache<T>(key: string, data: T, ttlMs = this.CACHE_TTL_MS): void {
    this.cache.set(key, {
      expiresAt: Date.now() + ttlMs,
      data,
    });
  }

  ping() {
    return {
      service: 'weather',
      status: 'ok',
      configured: Boolean(this.getApiKey()),
    };
  }

  private checkApiKey(): string {
    const key = this.getApiKey();
    if (!key) {
      throw new HttpException(
        'Weather service is not configured on the server (missing API key).',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return key;
  }

  private parseCoordinates(cityOrCoords?: string): { lat?: number; lon?: number; query?: string } {
    if (!cityOrCoords) return {};
    const coordsPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
    if (coordsPattern.test(cityOrCoords.trim())) {
      const [latStr, lonStr] = cityOrCoords.trim().split(',');
      return { lat: parseFloat(latStr), lon: parseFloat(lonStr) };
    }
    return { query: cityOrCoords.trim() };
  }

  async getCurrentWeather(optsOrCity: WeatherQueryOptions | string): Promise<NormalizedWeatherData> {
    const apiKey = this.checkApiKey();
    const baseUrl = this.getBaseUrl();

    const opts: WeatherQueryOptions =
      typeof optsOrCity === 'string' ? { city: optsOrCity } : optsOrCity || {};

    let lat = opts.lat;
    let lon = opts.lon;
    let queryCity = opts.city;

    if (queryCity && (lat === undefined || lon === undefined)) {
      const parsed = this.parseCoordinates(queryCity);
      if (parsed.lat !== undefined && parsed.lon !== undefined) {
        lat = parsed.lat;
        lon = parsed.lon;
        queryCity = undefined;
      }
    }

    if (!queryCity && (lat === undefined || lon === undefined)) {
      throw new HttpException(
        'A valid city name or coordinates (lat, lon) must be provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const units = opts.units || 'metric';
    const lang = opts.lang || 'fr';
    const cacheKey = `weather:current:${lat ?? ''}:${lon ?? ''}:${queryCity ?? ''}:${units}:${lang}`;
    const cached = this.getFromCache<NormalizedWeatherData>(cacheKey);
    if (cached) return cached;

    try {
      let endpoint: string;
      if (lat !== undefined && lon !== undefined) {
        endpoint = `${baseUrl}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
      } else {
        endpoint = `${baseUrl}/data/2.5/weather?q=${encodeURIComponent(queryCity!)}&units=${units}&lang=${lang}&appid=${apiKey}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpException(
          errorData.message || 'Failed to fetch weather data from provider',
          response.status,
        );
      }

      const data = await response.json();

      // Normalized response with full compatibility for existing UI components
      const result = {
        id: data.id,
        name: data.name,
        city: data.name,
        country: data.sys?.country || '',
        coord: data.coord || { lat: lat || 0, lon: lon || 0 },
        coordinates: data.coord || { lat: lat || 0, lon: lon || 0 },
        temperature: data.main?.temp,
        feels_like: data.main?.feels_like ?? data.main?.temp,
        temp_min: data.main?.temp_min,
        temp_max: data.main?.temp_max,
        humidity: data.main?.humidity ?? 0,
        pressure: data.main?.pressure ?? 1013,
        wind: {
          speed: data.wind?.speed ?? 0,
          deg: data.wind?.deg ?? 0,
          gust: data.wind?.gust ?? 0,
        },
        description: data.weather?.[0]?.description || '',
        icon: data.weather?.[0]?.icon || '01d',
        weather: data.weather || [{ description: '', icon: '01d', main: '' }],
        main: data.main || {
          temp: data.main?.temp,
          feels_like: data.main?.feels_like,
          temp_min: data.main?.temp_min,
          temp_max: data.main?.temp_max,
          humidity: data.main?.humidity,
          pressure: data.main?.pressure,
        },
        sys: data.sys || {
          country: data.sys?.country,
          sunrise: data.sys?.sunrise,
          sunset: data.sys?.sunset,
        },
        clouds: data.clouds?.all ?? 0,
        visibility: data.visibility ?? 10000,
        timezone: data.timezone ?? 0,
        dt: data.dt ?? Math.floor(Date.now() / 1000),
        units,
      };

      this.setInCache(cacheKey, result);
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error in getCurrentWeather: ${error.message}`);
      throw new HttpException(
        error.message || 'Internal server error while fetching weather',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getForecast(optsOrCity: WeatherQueryOptions | string) {
    const apiKey = this.checkApiKey();
    const baseUrl = this.getBaseUrl();

    const opts: WeatherQueryOptions =
      typeof optsOrCity === 'string' ? { city: optsOrCity } : optsOrCity || {};

    let lat = opts.lat;
    let lon = opts.lon;
    let queryCity = opts.city;

    if (queryCity && (lat === undefined || lon === undefined)) {
      const parsed = this.parseCoordinates(queryCity);
      if (parsed.lat !== undefined && parsed.lon !== undefined) {
        lat = parsed.lat;
        lon = parsed.lon;
        queryCity = undefined;
      }
    }

    if (!queryCity && (lat === undefined || lon === undefined)) {
      throw new HttpException(
        'A valid city name or coordinates (lat, lon) must be provided.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const units = opts.units || 'metric';
    const lang = opts.lang || 'fr';
    const cacheKey = `weather:forecast:${lat ?? ''}:${lon ?? ''}:${queryCity ?? ''}:${units}:${lang}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let endpoint: string;
      if (lat !== undefined && lon !== undefined) {
        endpoint = `${baseUrl}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${apiKey}`;
      } else {
        endpoint = `${baseUrl}/data/2.5/forecast?q=${encodeURIComponent(queryCity!)}&units=${units}&lang=${lang}&appid=${apiKey}`;
      }

      const response = await fetch(endpoint);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpException(
          errorData.message || 'Failed to fetch forecast data from provider',
          response.status,
        );
      }

      const data = await response.json();
      this.setInCache(cacheKey, data);
      return data;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Error in getForecast: ${error.message}`);
      throw new HttpException(
        error.message || 'Internal server error while fetching forecast',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchGeocoding(query: string, limit = 5): Promise<GeocodingResult[]> {
    const apiKey = this.checkApiKey();
    const baseUrl = this.getBaseUrl();

    if (!query || query.trim().length < 2) {
      return [];
    }

    const cleanQuery = query.trim().toLowerCase();
    const cacheKey = `weather:geo:${cleanQuery}:${limit}`;
    const cached = this.getFromCache<GeocodingResult[]>(cacheKey);
    if (cached) return cached;

    try {
      const endpoint = `${baseUrl}/geo/1.0/direct?q=${encodeURIComponent(
        query.trim(),
      )}&limit=${limit}&appid=${apiKey}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        this.logger.warn(`Geocoding request failed with status: ${response.status}`);
        return [];
      }

      const data = await response.json();
      if (!Array.isArray(data)) return [];

      const results = data.map((item) => ({
        name: item.name,
        lat: item.lat,
        lon: item.lon,
        country: item.country || '',
        state: item.state || '',
        local_names: item.local_names || {},
      }));

      this.setInCache(cacheKey, results, 60 * 60 * 1000); // 1 hour for geocoding
      return results;
    } catch (error) {
      this.logger.error(`Error in searchGeocoding: ${error.message}`);
      return [];
    }
  }
}
