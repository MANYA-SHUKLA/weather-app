'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WeatherIcon from './WeatherIcon';
import styles from './WeatherCard.module.css';
import { convertKelvinToCelsius, convertKelvinToFahrenheit } from '@/utils/helpers';

interface WeatherCardProps {
  city: string;
  country: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
  isCurrent?: boolean;
  unit: 'celsius' | 'fahrenheit';
  date?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  city,
  country,
  temperature,
  description,
  icon,
  humidity,
  windSpeed,
  feelsLike,
  isCurrent = false,
  unit,
  date
}) => {
  const displayTemp = unit === 'celsius' 
    ? convertKelvinToCelsius(temperature) 
    : convertKelvinToFahrenheit(temperature);
  
  const displayFeelsLike = unit === 'celsius'
    ? convertKelvinToCelsius(feelsLike)
    : convertKelvinToFahrenheit(feelsLike);

  return (
    <motion.div 
      className={styles.weatherCard}
      whileHover={{ scale: isCurrent ? 1.02 : 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.cardContent}>
        {isCurrent ? (
          <>
            <div className={styles.location}>
              <h2 className={styles.city}>{city}</h2>
              <p className={styles.country}>{country}</p>
            </div>
            {date && <p className={styles.date}>{date}</p>}
          </>
        ) : (
          <h3 className={styles.forecastCity}>{city}</h3>
        )}
        
        <div className={styles.weatherMain}>
          <WeatherIcon icon={icon} description={description} size={isCurrent ? 'lg' : 'md'} />
          <div className={styles.temperature}>
            <span className={styles.tempValue}>{displayTemp}°</span>
            <span className={styles.unit}>{unit === 'celsius' ? 'C' : 'F'}</span>
          </div>
        </div>
        
        <p className={styles.description}>{description}</p>
        
        <div className={styles.weatherDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Feels like</span>
            <span className={styles.detailValue}>{displayFeelsLike}°</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Humidity</span>
            <span className={styles.detailValue}>{humidity}%</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Wind</span>
            <span className={styles.detailValue}>{windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;