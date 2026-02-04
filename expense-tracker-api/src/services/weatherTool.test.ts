/**
 * Weather Tool Test Examples
 * 
 * This file demonstrates how to use the weather tools standalone.
 * Run with: npx ts-node src/services/weatherTool.test.ts
 * 
 * Make sure to set OPENWEATHER_API_KEY in your .env file first!
 */

import dotenv from 'dotenv';
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './weatherTool';

// Load environment variables
dotenv.config();

/**
 * Test current weather tool
 */
async function testCurrentWeather() {
  console.log('\n=== Testing Current Weather Tool ===\n');
  
  const tool = createGetCurrentWeatherTool();
  
  // Test 1: Get weather for London in metric units
  console.log('Test 1: London, UK (Metric)');
  const result1 = await tool.func({ location: 'London,UK', units: 'metric' });
  const data1 = JSON.parse(result1);
  console.log(data1.message);
  if (data1.success) {
    console.log('Full data:', JSON.stringify(data1.data, null, 2));
  }
  
  console.log('\n---\n');
  
  // Test 2: Get weather for New York in imperial units
  console.log('Test 2: New York, US (Imperial)');
  const result2 = await tool.func({ location: 'New York,US', units: 'imperial' });
  const data2 = JSON.parse(result2);
  console.log(data2.message);
  if (data2.success) {
    console.log('Temperature:', data2.data.temperature, '°F');
    console.log('Feels like:', data2.data.feelsLike, '°F');
    console.log('Conditions:', data2.data.description);
  }
  
  console.log('\n---\n');
  
  // Test 3: Test error handling with invalid location
  console.log('Test 3: Invalid Location');
  const result3 = await tool.func({ location: 'InvalidCityXYZ123', units: 'metric' });
  const data3 = JSON.parse(result3);
  if (!data3.success) {
    console.log('Error (expected):', data3.error);
  }
}

/**
 * Test weather forecast tool
 */
async function testWeatherForecast() {
  console.log('\n=== Testing Weather Forecast Tool ===\n');
  
  const tool = createGetWeatherForecastTool();
  
  // Test 1: Get 3-day forecast for Tokyo
  console.log('Test 1: Tokyo, JP (3-day forecast, Metric)');
  const result1 = await tool.func({ location: 'Tokyo,JP', days: 3, units: 'metric' });
  const data1 = JSON.parse(result1);
  console.log(data1.message);
  if (data1.success) {
    console.log('\nDetailed forecast:');
    data1.forecasts.forEach((forecast: any) => {
      console.log(`\n${forecast.date}:`);
      console.log(`  Temperature: ${forecast.temperature.min}°C - ${forecast.temperature.max}°C (avg: ${forecast.temperature.avg}°C)`);
      console.log(`  Conditions: ${forecast.description}`);
      console.log(`  Humidity: ${forecast.humidity}%`);
      console.log(`  Wind: ${forecast.windSpeed} m/s`);
      console.log(`  Precipitation chance: ${Math.round(forecast.precipitation)}%`);
    });
  }
  
  console.log('\n---\n');
  
  // Test 2: Get 5-day forecast for Paris
  console.log('Test 2: Paris, FR (5-day forecast, Metric)');
  const result2 = await tool.func({ location: 'Paris,FR', days: 5, units: 'metric' });
  const data2 = JSON.parse(result2);
  console.log(data2.message);
  
  console.log('\n---\n');
  
  // Test 3: Get 1-day forecast for San Francisco in imperial
  console.log('Test 3: San Francisco, US (1-day forecast, Imperial)');
  const result3 = await tool.func({ location: 'San Francisco,US', days: 1, units: 'imperial' });
  const data3 = JSON.parse(result3);
  console.log(data3.message);
  if (data3.success) {
    const forecast = data3.forecasts[0];
    console.log(`\nTomorrow's weather:`);
    console.log(`  High: ${forecast.temperature.max}°F`);
    console.log(`  Low: ${forecast.temperature.min}°F`);
    console.log(`  Conditions: ${forecast.description}`);
  }
}

/**
 * Simulate AI agent usage
 */
async function simulateAIAgentUsage() {
  console.log('\n=== Simulating AI Agent Usage ===\n');
  
  const currentWeatherTool = createGetCurrentWeatherTool();
  const forecastTool = createGetWeatherForecastTool();
  
  // Scenario: User asks "What's the weather like in Berlin and should I bring an umbrella this week?"
  console.log('User: "What\'s the weather like in Berlin and should I bring an umbrella this week?"\n');
  
  // AI would call current weather tool
  console.log('[AI calls get_current_weather for Berlin]');
  const currentResult = await currentWeatherTool.func({ location: 'Berlin,DE', units: 'metric' });
  const currentData = JSON.parse(currentResult);
  
  if (currentData.success) {
    console.log(`Current: ${currentData.message}\n`);
  }
  
  // AI would call forecast tool
  console.log('[AI calls get_weather_forecast for Berlin, 5 days]');
  const forecastResult = await forecastTool.func({ location: 'Berlin,DE', days: 5, units: 'metric' });
  const forecastData = JSON.parse(forecastResult);
  
  if (forecastData.success) {
    console.log(`Forecast: ${forecastData.message}\n`);
    
    // AI analyzes precipitation chances
    const rainyDays = forecastData.forecasts.filter((f: any) => f.precipitation > 30);
    
    console.log('[AI Response]:');
    console.log(`Currently in Berlin it's ${currentData.data.temperature}°C with ${currentData.data.description}.`);
    
    if (rainyDays.length > 0) {
      console.log(`\nYes, you should bring an umbrella! There's a chance of rain on ${rainyDays.length} day(s) this week:`);
      rainyDays.forEach((day: any) => {
        console.log(`  - ${day.date}: ${Math.round(day.precipitation)}% chance, ${day.description}`);
      });
    } else {
      console.log(`\nGood news! No significant rain expected this week. You probably won't need an umbrella.`);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         Weather Tool Test Suite                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Check if API key is configured
  if (!process.env.OPENWEATHER_API_KEY) {
    console.error('\n❌ ERROR: OPENWEATHER_API_KEY is not set in environment variables!');
    console.error('Please add it to your .env file and try again.\n');
    process.exit(1);
  }
  
  console.log('✓ API Key found\n');
  
  try {
    await testCurrentWeather();
    await testWeatherForecast();
    await simulateAIAgentUsage();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         All Tests Completed Successfully! ✓               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

export { testCurrentWeather, testWeatherForecast, simulateAIAgentUsage };

