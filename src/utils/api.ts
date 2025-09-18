const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchWeatherData = async (city?: string, lat?: string, lon?: string) => {
  let url = '';
  
  if (city) {
    url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
  } else if (lat && lon) {
    url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  } else {
    throw new Error('Either city or lat/lon must be provided');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  return response.json();
};

export const fetchForecastData = async (lat: number, lon: number) => {
  const response = await fetch(
    `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch forecast data');
  }
  return response.json();
};

export const fetchAirQualityData = async (lat: number, lon: number) => {
  const response = await fetch(
    `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch air quality data');
  }
  return response.json();
};