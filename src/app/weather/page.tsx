'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import WeatherCard from '@/components/WeatherCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './weather.module.css';
import {
  WeatherData,
  ForecastData,
  AirQualityData,
} from '@/types/weather';

import {
  getWeatherBackground,
  convertKelvinToCelsius,
  convertKelvinToFahrenheit,
  formatDate,
  saveToSearchHistory,
} from '@/utils/helpers';
import { WEATHER_BACKGROUNDS, AQI_LEVELS } from '@/utils/constants';

function WeatherContent() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [unit, setUnit] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const forecastRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('API key is not configured. Please check your environment variables.');
        }

        let apiUrl = '';

        if (city) {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`;
        } else if (lat && lon) {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
        } else {
          setError('No location provided. Please search for a city or use your location.');
          setIsLoading(false);
          return;
        }

        const weatherResponse = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } });
        if (!weatherResponse.ok) {
          if (weatherResponse.status === 401) throw new Error('Invalid API key.');
          if (weatherResponse.status === 404) throw new Error('City not found.');
          throw new Error(`API Error: ${weatherResponse.statusText}`);
        }
        const weather: WeatherData = await weatherResponse.json();

        if (city && weather.name && weather.sys.country) {
          saveToSearchHistory(weather.name, weather.sys.country);
        }

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${apiKey}`;
        const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${weather.coord.lat}&lon=${weather.coord.lon}&appid=${apiKey}`;

        const [forecastResponse, aqiResponse] = await Promise.all([
          fetch(forecastUrl),
          fetch(aqiUrl),
        ]);

        if (!forecastResponse.ok) throw new Error('Failed to fetch forecast data');

        const forecast = await forecastResponse.json();
        const aqi = aqiResponse.ok ? await aqiResponse.json() : null;

        setWeatherData(weather);
        setForecastData(forecast);
        setAirQualityData(aqi);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [city, lat, lon]);

  const toggleUnit = () => {
    setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius');
  };

  const shareWeather = async () => {
    if (weatherData && navigator.share) {
      try {
        await navigator.share({
          title: `Weather in ${weatherData.name}`,
          text: `Current weather in ${weatherData.name}: ${weatherData.weather[0].description}, ${convertKelvinToCelsius(weatherData.main.temp)}°C`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  // Swipe handlers for forecast horizontal scroll
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
  };
  const onTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null && forecastRef.current) {
      const distance = touchStartX.current - touchEndX.current;
      const threshold = 50; // Minimum swipe distance

      if (distance > threshold) {
        forecastRef.current.scrollBy({ left: 150, behavior: 'smooth' });
      } else if (distance < -threshold) {
        forecastRef.current.scrollBy({ left: -150, behavior: 'smooth' });
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const weatherType = weatherData ? getWeatherBackground(weatherData.weather[0].main) : 'default';
  const backgroundImage = WEATHER_BACKGROUNDS[weatherType as keyof typeof WEATHER_BACKGROUNDS];

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData || !forecastData) return null;

  const aqi = airQualityData?.list[0]?.main.aqi;
  const aqiInfo = aqi ? AQI_LEVELS[aqi as keyof typeof AQI_LEVELS] : null;

  type DailyForecast = {
    date: string;
    items: typeof forecastData.list[number][];
    minTemp: number;
    maxTemp: number;
  };

  const dailyForecast: DailyForecast[] = forecastData.list.reduce((acc: DailyForecast[], item) => {
    const date = new Date(item.dt * 1000).toDateString();
    const existingDay = acc.find((d) => d.date === date);

    if (!existingDay) {
      acc.push({
        date,
        items: [item],
        minTemp: item.main.temp_min,
        maxTemp: item.main.temp_max,
      });
    } else {
      existingDay.items.push(item);
      existingDay.minTemp = Math.min(existingDay.minTemp, item.main.temp_min);
      existingDay.maxTemp = Math.max(existingDay.maxTemp, item.main.temp_max);
    }
    return acc;
  }, []).slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.background} style={{ backgroundImage: `url(${backgroundImage})` }}></div>

      <div className={styles.content}>
        <div className={styles.header}>
          <button onClick={() => router.push('/')} className={styles.backButton}>
            ← Back
          </button>

          <div className={styles.controls}>
            <button onClick={toggleUnit} className={styles.unitButton}>
              °{unit === 'celsius' ? 'C' : 'F'}
            </button>
            <button onClick={shareWeather} className={styles.shareButton}>
              Share
            </button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <WeatherCard
            city={weatherData.name}
            country={weatherData.sys.country}
            temperature={weatherData.main.temp}
            description={weatherData.weather[0].description}
            icon={weatherData.weather[0].icon}
            humidity={weatherData.main.humidity}
            windSpeed={weatherData.wind.speed}
            feelsLike={weatherData.main.feels_like}
            isCurrent={true}
            unit={unit}
            date={formatDate(weatherData.dt)}
          />
        </motion.div>

        {aqiInfo && (
          <motion.div className={styles.aqiSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <h3 className={styles.sectionTitle}>Air Quality</h3>
            <div className={styles.aqiCard}>
              <span className={styles.aqiValue}>AQI: {aqi}</span>
              <span className={`${styles.aqiLevel} ${aqiInfo.color}`}>{aqiInfo.level}</span>
            </div>
          </motion.div>
        )}

        <motion.div className={styles.forecastSection} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <h3 className={styles.sectionTitle}>5-Day Forecast</h3>
          <div
            className={styles.forecastContainer}
            ref={forecastRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {dailyForecast.map((day, index) => {
              const displayMin = unit === 'celsius' ? convertKelvinToCelsius(day.minTemp) : convertKelvinToFahrenheit(day.minTemp);
              const displayMax = unit === 'celsius' ? convertKelvinToCelsius(day.maxTemp) : convertKelvinToFahrenheit(day.maxTemp);

              return (
                <motion.div
                  key={day.date}
                  className={styles.forecastDay}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h4 className="font-bold text-black">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</h4>
                  <Image
                    src={`https://openweathermap.org/img/wn/${day.items[0].weather[0].icon}.png`}
                    alt={day.items[0].weather[0].description}
                    width={50}
                    height={50}
                    className={styles.forecastIcon}
                    priority={false}
                  />
                  <div className={`${styles.tempRange} font-bold text-black`}>
                    <span>{displayMax}°</span>
                    <span className={styles.tempMin}>{displayMin}°</span>
                  </div>
                  <p className={`${styles.forecastDesc} font-bold text-black`}>{day.items[0].weather[0].description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Weather() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <WeatherContent />
    </Suspense>
  );
}
