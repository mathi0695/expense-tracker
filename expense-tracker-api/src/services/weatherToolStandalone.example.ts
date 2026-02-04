/**
 * Standalone Weather Tool Usage Example
 * 
 * This file demonstrates how to use the weather tools WITHOUT an AI agent.
 * Perfect for direct API calls, custom integrations, or testing.
 * 
 * Usage:
 * 1. Set OPENWEATHER_API_KEY in your .env file
 * 2. Run: npx ts-node src/services/weatherToolStandalone.example.ts
 */

import dotenv from 'dotenv';
import { createGetCurrentWeatherTool, createGetWeatherForecastTool } from './weatherTool';

// Load environment variables
dotenv.config();

/**
 * Example 1: Simple current weather check
 */
async function example1_SimpleWeatherCheck() {
  console.log('\n📍 Example 1: Simple Weather Check\n');
  
  const weatherTool = createGetCurrentWeatherTool();
  
  // Get current weather for London
  const result = await weatherTool.func({
    location: 'London,UK',
    units: 'metric'
  });
  
  const data = JSON.parse(result);
  
  if (data.success) {
    console.log('✓ Success!');
    console.log(data.message);
  } else {
    console.log('✗ Error:', data.error);
  }
}

/**
 * Example 2: Multiple cities comparison
 */
async function example2_CompareCities() {
  console.log('\n🌍 Example 2: Compare Weather in Multiple Cities\n');
  
  const weatherTool = createGetCurrentWeatherTool();
  const cities = ['Tokyo,JP', 'New York,US', 'London,UK', 'Sydney,AU', 'Dubai,AE'];
  
  console.log('Current temperatures around the world:\n');
  
  for (const city of cities) {
    const result = await weatherTool.func({ location: city, units: 'metric' });
    const data = JSON.parse(result);
    
    if (data.success) {
      console.log(`${data.data.location.padEnd(15)} ${data.data.temperature}°C - ${data.data.description}`);
    }
  }
}

/**
 * Example 3: Detailed weather analysis
 */
async function example3_DetailedAnalysis() {
  console.log('\n🔍 Example 3: Detailed Weather Analysis\n');
  
  const weatherTool = createGetCurrentWeatherTool();
  const result = await weatherTool.func({ location: 'Paris,FR', units: 'metric' });
  const data = JSON.parse(result);
  
  if (data.success) {
    const weather = data.data;
    
    console.log(`Weather Report for ${weather.location}, ${weather.country}`);
    console.log('═'.repeat(50));
    console.log(`Temperature:     ${weather.temperature}°C (feels like ${weather.feelsLike}°C)`);
    console.log(`Conditions:      ${weather.description}`);
    console.log(`Humidity:        ${weather.humidity}%`);
    console.log(`Wind Speed:      ${weather.windSpeed} m/s`);
    console.log(`Pressure:        ${weather.pressure} hPa`);
    console.log(`Visibility:      ${weather.visibility} km`);
    console.log(`Cloud Cover:     ${weather.cloudiness}%`);
    console.log('═'.repeat(50));
  }
}

/**
 * Example 4: Weather forecast for trip planning
 */
async function example4_TripPlanning() {
  console.log('\n✈️  Example 4: Trip Planning with Forecast\n');
  
  const forecastTool = createGetWeatherForecastTool();
  const destination = 'Barcelona,ES';
  
  console.log(`Planning a trip to ${destination}? Here's the 5-day forecast:\n`);
  
  const result = await forecastTool.func({
    location: destination,
    days: 5,
    units: 'metric'
  });
  
  const data = JSON.parse(result);
  
  if (data.success) {
    data.forecasts.forEach((forecast: any, index: number) => {
      const date = new Date(forecast.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      console.log(`${dayName}, ${forecast.date}:`);
      console.log(`  🌡️  ${forecast.temperature.min}°C - ${forecast.temperature.max}°C`);
      console.log(`  ☁️  ${forecast.description}`);
      console.log(`  💧 ${Math.round(forecast.precipitation)}% chance of rain`);
      console.log(`  💨 Wind: ${forecast.windSpeed} m/s`);
      console.log('');
    });
    
    // Analyze the forecast
    const rainyDays = data.forecasts.filter((f: any) => f.precipitation > 50);
    const avgTemp = data.forecasts.reduce((sum: number, f: any) => sum + f.temperature.avg, 0) / data.forecasts.length;
    
    console.log('📊 Trip Summary:');
    console.log(`  Average temperature: ${Math.round(avgTemp)}°C`);
    console.log(`  Rainy days expected: ${rainyDays.length}`);
    console.log(`  Recommendation: ${rainyDays.length > 2 ? 'Pack an umbrella!' : 'Should be mostly dry!'}`);
  }
}

/**
 * Example 5: Weather-based decision making
 */
async function example5_WeatherDecisions() {
  console.log('\n🤔 Example 5: Weather-Based Decisions\n');
  
  const currentTool = createGetCurrentWeatherTool();
  const forecastTool = createGetWeatherForecastTool();
  
  const location = 'Seattle,US';
  
  // Get current weather
  const currentResult = await currentTool.func({ location, units: 'imperial' });
  const currentData = JSON.parse(currentResult);
  
  // Get forecast
  const forecastResult = await forecastTool.func({ location, days: 3, units: 'imperial' });
  const forecastData = JSON.parse(forecastResult);
  
  if (currentData.success && forecastData.success) {
    console.log(`Should you go for a run in ${location}?\n`);
    
    const current = currentData.data;
    const tomorrow = forecastData.forecasts[1];
    
    // Decision logic
    const decisions = [];
    
    if (current.temperature < 40 || current.temperature > 90) {
      decisions.push(`❌ Current temperature (${current.temperature}°F) is not ideal for running`);
    } else {
      decisions.push(`✓ Current temperature (${current.temperature}°F) is good for running`);
    }
    
    if (current.description.includes('rain')) {
      decisions.push(`❌ It's currently raining (${current.description})`);
    } else {
      decisions.push(`✓ No rain right now (${current.description})`);
    }
    
    if (current.windSpeed > 15) {
      decisions.push(`⚠️  Windy conditions (${current.windSpeed} mph)`);
    }
    
    console.log('Current conditions:');
    decisions.forEach(d => console.log(`  ${d}`));
    
    console.log(`\nTomorrow's forecast:`);
    console.log(`  Temperature: ${tomorrow.temperature.min}-${tomorrow.temperature.max}°F`);
    console.log(`  Conditions: ${tomorrow.description}`);
    console.log(`  Rain chance: ${Math.round(tomorrow.precipitation)}%`);
    
    // Final recommendation
    const goodToRun = !current.description.includes('rain') && 
                      current.temperature >= 40 && 
                      current.temperature <= 90;
    
    console.log(`\n${goodToRun ? '✅ Good time for a run!' : '⛔ Maybe wait for better weather'}`);
  }
}

/**
 * Example 6: Error handling demonstration
 */
async function example6_ErrorHandling() {
  console.log('\n⚠️  Example 6: Error Handling\n');
  
  const weatherTool = createGetCurrentWeatherTool();
  
  // Test 1: Invalid location
  console.log('Test 1: Invalid location');
  const result1 = await weatherTool.func({ location: 'InvalidCity12345', units: 'metric' });
  const data1 = JSON.parse(result1);
  console.log(data1.success ? '✓ Success' : `✗ Error: ${data1.error}`);
  
  console.log('\nTest 2: Valid location');
  const result2 = await weatherTool.func({ location: 'Berlin,DE', units: 'metric' });
  const data2 = JSON.parse(result2);
  console.log(data2.success ? `✓ Success: ${data2.message}` : `✗ Error: ${data2.error}`);
}

/**
 * Main function to run all examples
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Weather Tool Standalone Examples                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Check API key
  if (!process.env.OPENWEATHER_API_KEY) {
    console.error('\n❌ ERROR: OPENWEATHER_API_KEY not found!');
    console.error('Please add it to your .env file:\n');
    console.error('OPENWEATHER_API_KEY=your_api_key_here\n');
    process.exit(1);
  }
  
  try {
    await example1_SimpleWeatherCheck();
    await example2_CompareCities();
    await example3_DetailedAnalysis();
    await example4_TripPlanning();
    await example5_WeatherDecisions();
    await example6_ErrorHandling();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     All Examples Completed Successfully! ✓                ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export {
  example1_SimpleWeatherCheck,
  example2_CompareCities,
  example3_DetailedAnalysis,
  example4_TripPlanning,
  example5_WeatherDecisions,
  example6_ErrorHandling
};

