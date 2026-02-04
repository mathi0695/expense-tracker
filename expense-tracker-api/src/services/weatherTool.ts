import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import axios from 'axios';

/**
 * Weather Tool for AI Agent
 * 
 * This tool allows an AI agent to fetch current weather and forecast data
 * for any location using the OpenWeatherMap API.
 * 
 * Setup:
 * 1. Get a free API key from https://openweathermap.org/api
 * 2. Add OPENWEATHER_API_KEY to your .env file
 */

interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  pressure: number;
  visibility: number;
  cloudiness: number;
}

interface ForecastData {
  date: string;
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  description: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

/**
 * Schema for getting current weather
 */
export const getCurrentWeatherSchema = z.object({
  location: z.string().describe('City name or "city,country" (e.g., "London" or "London,UK")'),
  units: z.enum(['metric', 'imperial']).optional().default('metric').describe('Temperature units: metric (Celsius) or imperial (Fahrenheit)'),
});

/**
 * Schema for getting weather forecast
 */
export const getWeatherForecastSchema = z.object({
  location: z.string().describe('City name or "city,country" (e.g., "London" or "London,UK")'),
  days: z.number().min(1).max(5).optional().default(3).describe('Number of days to forecast (1-5)'),
  units: z.enum(['metric', 'imperial']).optional().default('metric').describe('Temperature units: metric (Celsius) or imperial (Fahrenheit)'),
});

/**
 * Create a tool for getting current weather
 */
export function createGetCurrentWeatherTool() {
  return new DynamicStructuredTool({
    name: 'get_current_weather',
    description: 'Get the current weather conditions for a specific location. Returns temperature, humidity, wind speed, and weather description.',
    schema: getCurrentWeatherSchema,
    func: async ({ location, units = 'metric' }) => {
      try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          return JSON.stringify({
            success: false,
            error: 'Weather API key is not configured. Please add OPENWEATHER_API_KEY to environment variables.',
          });
        }

        const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            q: location,
            appid: apiKey,
            units: units,
          },
        });

        const data = response.data;
        const unitSymbol = units === 'metric' ? '°C' : '°F';
        const speedUnit = units === 'metric' ? 'm/s' : 'mph';

        const weatherData: WeatherData = {
          location: data.name,
          country: data.sys.country,
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          windSpeed: data.wind.speed,
          pressure: data.main.pressure,
          visibility: data.visibility / 1000, // Convert to km
          cloudiness: data.clouds.all,
        };

        return JSON.stringify({
          success: true,
          data: weatherData,
          message: `Current weather in ${weatherData.location}, ${weatherData.country}: ${weatherData.temperature}${unitSymbol}, ${weatherData.description}. Feels like ${weatherData.feelsLike}${unitSymbol}. Humidity: ${weatherData.humidity}%, Wind: ${weatherData.windSpeed} ${speedUnit}.`,
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          return JSON.stringify({
            success: false,
            error: `Location "${location}" not found. Please check the spelling or try a different format (e.g., "City,Country").`,
          });
        }
        
        return JSON.stringify({
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to fetch weather data',
        });
      }
    },
  });
}

/**
 * Create a tool for getting weather forecast
 */
export function createGetWeatherForecastTool() {
  return new DynamicStructuredTool({
    name: 'get_weather_forecast',
    description: 'Get weather forecast for the next 1-5 days for a specific location. Returns daily temperature ranges, conditions, and precipitation.',
    schema: getWeatherForecastSchema,
    func: async ({ location, days = 3, units = 'metric' }) => {
      try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        if (!apiKey) {
          return JSON.stringify({
            success: false,
            error: 'Weather API key is not configured. Please add OPENWEATHER_API_KEY to environment variables.',
          });
        }

        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: location,
            appid: apiKey,
            units: units,
            cnt: days * 8, // API returns 3-hour intervals, 8 per day
          },
        });

        const data = response.data;
        const unitSymbol = units === 'metric' ? '°C' : '°F';
        const speedUnit = units === 'metric' ? 'm/s' : 'mph';

        // Group forecast by day
        const forecastByDay: { [key: string]: any[] } = {};
        
        data.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toISOString().split('T')[0];
          if (!forecastByDay[date]) {
            forecastByDay[date] = [];
          }
          forecastByDay[date].push(item);
        });

        // Calculate daily summaries
        const forecasts: ForecastData[] = Object.entries(forecastByDay)
          .slice(0, days)
          .map(([date, items]) => {
            const temps = items.map((item: any) => item.main.temp);
            const descriptions = items.map((item: any) => item.weather[0].description);
            const mostCommonDesc = descriptions.sort((a: string, b: string) =>
              descriptions.filter((v: string) => v === a).length - descriptions.filter((v: string) => v === b).length
            ).pop();

            return {
              date,
              temperature: {
                min: Math.round(Math.min(...temps)),
                max: Math.round(Math.max(...temps)),
                avg: Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length),
              },
              description: mostCommonDesc,
              humidity: Math.round(items.reduce((sum: number, item: any) => sum + item.main.humidity, 0) / items.length),
              windSpeed: Math.round(items.reduce((sum: number, item: any) => sum + item.wind.speed, 0) / items.length * 10) / 10,
              precipitation: items.reduce((sum: number, item: any) => sum + (item.pop || 0), 0) / items.length * 100,
            };
          });

        const summary = forecasts.map(f => 
          `${f.date}: ${f.temperature.min}-${f.temperature.max}${unitSymbol}, ${f.description}`
        ).join('; ');

        return JSON.stringify({
          success: true,
          location: data.city.name,
          country: data.city.country,
          forecasts,
          message: `${days}-day forecast for ${data.city.name}, ${data.city.country}: ${summary}`,
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          return JSON.stringify({
            success: false,
            error: `Location "${location}" not found. Please check the spelling or try a different format (e.g., "City,Country").`,
          });
        }
        
        return JSON.stringify({
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to fetch weather forecast',
        });
      }
    },
  });
}

