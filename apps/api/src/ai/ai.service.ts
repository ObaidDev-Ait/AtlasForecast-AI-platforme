import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  // Simple in-memory rate limiting store: userId -> timestamp[]
  private readonly rateLimits = new Map<string, number[]>();

  constructor(
    private readonly configService: ConfigService,
    private readonly weatherService: WeatherService,
  ) {}

  private checkRateLimit(identifier: string) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5;

    let timestamps = this.rateLimits.get(identifier) || [];
    // Filter timestamps within the 1-minute window
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      throw new HttpException(
        'Too many requests. AI Copilot is limited to 5 queries per minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    timestamps.push(now);
    this.rateLimits.set(identifier, timestamps);
  }

  async getWeatherAdvice(body: { city: string; question: string }, userId?: string) {
    const { city, question } = body;

    if (!city || !question) {
      throw new HttpException('City and question are required', HttpStatus.BAD_REQUEST);
    }

    // Apply rate limit using userId or fallback to city name identifier
    this.checkRateLimit(userId || city);

    try {
      const weather = await this.weatherService.getCurrentWeather(city);
      const forecast = await this.weatherService.getForecast(city);

      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      
      const systemPrompt = `You are a production-grade AI Weather Copilot for AtlasForecast, inspired by premium SaaS models.
Your task is to analyze the meteorological context provided and answer the user's question with actionable, highly professional, and personalized recommendations.

Ensure you explicitly support and address these core target activities when relevant:
1. Travel Planning (clothing, transportation, sightseeing advice).
2. Hiking Advice (trail safety, visibility, wind speeds, equipment).
3. Event Planning (outdoor setups, evening moisture, logistics).
4. Agriculture Recommendations (evaporation, irrigation schedules, crop hazards).

CRITICAL CONTEXT:
- Target City: ${city}
- Current Temp: ${weather.temperature}°C
- Current Condition: ${weather.description}
- Forecast Summaries: ${JSON.stringify(forecast.list?.slice(0, 8).map((f: any) => ({
        time: f.dt_txt,
        temp: f.main?.temp,
        description: f.weather?.[0]?.description,
      })))}

Formatting: Keep your advice clean, structured, and easy to read. Avoid prefixing your response with meta text like "Here is your advice". Output directly the advice.`;

      if (apiKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: `${systemPrompt}\n\nUser Question: ${question}` }],
                }],
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            const textAdvice = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textAdvice) {
              return {
                city,
                question,
                advice: textAdvice.trim(),
                currentWeather: {
                  temp: weather.temperature,
                  description: weather.description,
                },
              };
            }
          }
          this.logger.warn('Gemini API request failed or returned empty response. Falling back to rules engine.');
        } catch (apiErr) {
          this.logger.error(`Failed to reach Gemini API: ${apiErr.message}. Falling back to rules engine.`);
        }
      }

      // Rules-based fallback engine (if no API key or API call fails)
      const q = question.toLowerCase();
      let advice = '';

      if (q.includes('rain') || q.includes('pluie') || q.includes('pleuvoir')) {
        const hasRainNow = weather.description?.toLowerCase().includes('rain') || weather.description?.toLowerCase().includes('pluie');
        const next24h = forecast.list?.slice(0, 8) || [];
        const hasRainSoon = next24h.some((f: any) =>
          f.weather?.[0]?.description?.toLowerCase().includes('rain') ||
          f.weather?.[0]?.description?.toLowerCase().includes('pluie')
        );

        if (hasRainNow) {
          advice = `Yes, it is currently raining in ${weather.city}. We highly recommend carry an umbrella or high-quality waterproof jacket. Avoid outdoor setups.`;
        } else if (hasRainSoon) {
          advice = `Rain is forecasted in ${weather.city} within the next 24 hours. Ensure to carry rain protection and safeguard agricultural activities.`;
        } else {
          advice = `No precipitation is expected in ${weather.city} today. Clean trails for hiking and travel sightseeing.`;
        }
      } else if (q.includes('wear') || q.includes('porter') || q.includes('habill')) {
        const temp = weather.temperature;
        if (temp < 12) {
          advice = `Cold temperatures detected in ${weather.city} (${temp}°C). We suggest layering up: thermal underwear, a thick coat, and gloves if hiking.`;
        } else if (temp < 22) {
          advice = `Cool, pleasant weather in ${weather.city} (${temp}°C). A light jacket or sweater is perfect for travel and city walks.`;
        } else {
          advice = `Warm weather in ${weather.city} (${temp}°C). Lightweight clothes are advised. Keep hydrated.`;
        }
      } else if (q.includes('hiking') || q.includes('randonn')) {
        const temp = weather.temperature;
        const desc = weather.description?.toLowerCase() || '';
        const isBad = desc.includes('rain') || desc.includes('pluie') || desc.includes('storm') || desc.includes('orage');

        if (isBad) {
          advice = `Hiking is not recommended today in ${weather.city} due to adverse conditions: ${weather.description}. Stay safe.`;
        } else if (temp < 6 || temp > 33) {
          advice = `Extreme temperature conditions in ${weather.city} (${temp}°C). Ensure specialized gear and high water supplies if hiking.`;
        } else {
          advice = `Optimal hiking conditions in ${weather.city}. Temp: ${temp}°C, Sky: ${weather.description}. Enjoy your trail!`;
        }
      } else {
        advice = `Copilot Summary for ${weather.city}: Current temp is ${weather.temperature}°C with ${weather.description}. Conditions are highly stable for agriculture and outdoor events. Let me know if you need specific travel, hiking, event, or agricultural planning metrics!`;
      }

      return {
        city,
        question,
        advice,
        currentWeather: {
          temp: weather.temperature,
          description: weather.description,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error generating weather advice from copilot',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
