'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './home.module.css';
import { getSearchHistory } from '@/utils/helpers';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const history = getSearchHistory();
    setSearchHistory(history);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      router.push(`/weather?city=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Geolocation coordinates:', latitude, longitude);

          // First, let's get the city name from coordinates
          try {
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
            const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

            const response = await fetch(reverseGeocodeUrl);
            if (response.ok) {
              const locationData = await response.json();
              if (locationData && locationData.length > 0) {
                const cityName = locationData[0].name;
                const country = locationData[0].country;
                router.push(`/weather?city=${encodeURIComponent(cityName)}`);
              } else {
                // Fallback to coordinates if city name not found
                router.push(`/weather?lat=${latitude}&lon=${longitude}`);
              }
            } else {
              // Fallback to coordinates if reverse geocoding fails
              router.push(`/weather?lat=${latitude}&lon=${longitude}`);
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            // Fallback to coordinates
            router.push(`/weather?lat=${latitude}&lon=${longitude}`);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);

          // Show specific error messages based on error code
          switch (error.code) {
            case error.PERMISSION_DENIED:
              alert('Location access denied. Please allow location access in your browser settings or search for a city manually.');
              break;
            case error.POSITION_UNAVAILABLE:
              alert('Location information unavailable. Please try again or search for a city manually.');
              break;
            case error.TIMEOUT:
              alert('Location request timed out. Please try again or search for a city manually.');
              break;
            default:
              alert('Unable to get your location. Please search for a city manually.');
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please search for a city manually.');
    }
  };
  const handleHistoryClick = (city: string, country: string) => {
    setIsLoading(true);
    router.push(`/weather?city=${encodeURIComponent(city)}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Fetching weather data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}></div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className={styles.title}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          Your Daily Weather Companion 🌤
        </motion.h1>

        <motion.form
          onSubmit={handleSearch}
          className={styles.searchForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city name..."
              className={styles.searchInput}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                }
              }}
            />
            <button type="submit" className={styles.searchButton}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </motion.form>

        <motion.button
          onClick={handleGeolocation}
          className={styles.geolocationButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className={styles.locationIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Use My Location
        </motion.button>

        {searchHistory.length > 0 && (
          <motion.div
            className={styles.historySection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className={styles.historyTitle}>Recent Searches</h3>
            <div className={styles.historyList}>
              {searchHistory.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleHistoryClick(item.city, item.country)}
                  className={styles.historyItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.city}, {item.country}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}