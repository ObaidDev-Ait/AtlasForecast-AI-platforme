import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
  }

  ping() {
    return {
      service: 'weather',
      status: 'ok',
    };
  }

  async getCurrentWeather(city: string) {
    if (!city) {
      throw new HttpException('City parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      let url: string;
      const coordsPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
      if (coordsPattern.test(city)) {
        const [lat, lon] = city.split(',');
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=fr`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpException(
          errorData.message || 'Error fetching weather data',
          response.status
        );
      }

      const data = await response.json();
      return {
        city: data.name,
        temperature: data.main?.temp,
        description: data.weather?.[0]?.description,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error fetching weather data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getForecast(city: string) {
    if (!city) {
      throw new HttpException('City parameter is required', HttpStatus.BAD_REQUEST);
    }

    try {
      let url: string;
      const coordsPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
      if (coordsPattern.test(city)) {
        const [lat, lon] = city.split(',');
        url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=fr`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new HttpException(
          errorData.message || 'Error fetching forecast data',
          response.status
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error fetching forecast data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
