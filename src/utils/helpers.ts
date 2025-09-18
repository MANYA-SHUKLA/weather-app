import { SearchHistoryItem } from '@/types/weather';

export const getWeatherBackground = (weatherMain: string): string => {
  const weather = weatherMain.toLowerCase();
  if (weather.includes('clear')) return 'sunny';
  if (weather.includes('cloud')) return 'cloudy';
  if (weather.includes('rain') || weather.includes('drizzle')) return 'rainy';
  if (weather.includes('snow')) return 'snowy';
  if (weather.includes('fog') || weather.includes('mist')) return 'foggy';
  return 'default';
};

export const convertKelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

export const convertKelvinToFahrenheit = (kelvin: number): number => {
  return Math.round((kelvin - 273.15) * 9/5 + 32);
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const saveToSearchHistory = (city: string, country: string): void => {
  if (typeof window === 'undefined') return;

  const history: SearchHistoryItem[] = JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
  
  // Remove if already exists
  const filteredHistory = history.filter(item => 
    !(item.city.toLowerCase() === city.toLowerCase() && item.country.toLowerCase() === country.toLowerCase())
  );

  const newItem: SearchHistoryItem = {
    id: Date.now().toString(),
    city,
    country,
    timestamp: Date.now()
  };

  const updatedHistory = [newItem, ...filteredHistory].slice(0, 5);
  localStorage.setItem('weatherSearchHistory', JSON.stringify(updatedHistory));
};

export const getSearchHistory = (): SearchHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('weatherSearchHistory') || '[]');
};

export const getAQIDescription = (aqi: number): string => {
  const levels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  return levels[aqi - 1] || 'Unknown';
};