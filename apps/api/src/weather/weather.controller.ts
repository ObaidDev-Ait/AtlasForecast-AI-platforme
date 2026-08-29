import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get('ping')
  ping() {
    return this.weatherService.ping();
  }

  @Get('current')
  getCurrentWeather(
    @Query('city') city?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('units') units?: string,
    @Query('lang') lang?: string,
  ) {
    return this.weatherService.getCurrentWeather({
      city,
      lat: lat !== undefined && lat !== '' ? parseFloat(lat) : undefined,
      lon: lon !== undefined && lon !== '' ? parseFloat(lon) : undefined,
      units,
      lang,
    });
  }

  @Get('forecast')
  getForecast(
    @Query('city') city?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('units') units?: string,
    @Query('lang') lang?: string,
  ) {
    return this.weatherService.getForecast({
      city,
      lat: lat !== undefined && lat !== '' ? parseFloat(lat) : undefined,
      lon: lon !== undefined && lon !== '' ? parseFloat(lon) : undefined,
      units,
      lang,
    });
  }

  @Get('geocoding')
  getGeocoding(
    @Query('q') q?: string,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ) {
    const searchTerm = q || query || '';
    const numLimit = limit ? parseInt(limit, 10) : 5;
    return this.weatherService.searchGeocoding(searchTerm, isNaN(numLimit) ? 5 : numLimit);
  }

  @Get('search')
  searchCities(
    @Query('q') q?: string,
    @Query('query') query?: string,
    @Query('limit') limit?: string,
  ) {
    const searchTerm = q || query || '';
    const numLimit = limit ? parseInt(limit, 10) : 5;
    return this.weatherService.searchGeocoding(searchTerm, isNaN(numLimit) ? 5 : numLimit);
  }
}
