import React from "react";
import { motion, MotionProps } from "framer-motion";

interface WeatherIconProps {
  icon: string;
  description: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

const WeatherIcon: React.FC<WeatherIconProps> = ({
  icon,
  description,
  size = "md",
  animate = true,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const getAnimationProps = (iconCode: string): MotionProps => {
    if (!animate) return {};

    const mainIcon = iconCode.slice(0, 2);
    switch (mainIcon) {
      case "01": // clear sky
        return {
          animate: { rotate: 360 },
          transition: { duration: 20, repeat: Infinity, ease: "linear" },
        };
      case "02": // few clouds
      case "03": // scattered clouds
      case "04": // broken clouds
        return {
          animate: { x: [0, 10, 0, -10, 0] },
          transition: { duration: 8, repeat: Infinity },
        };
      case "09": // shower rain
      case "10": // rain
        return {
          animate: { y: [0, 5, 0] },
          transition: { duration: 2, repeat: Infinity },
        };
      case "13": // snow
        return {
          animate: { y: [0, 3, 0], rotate: [0, 5, 0, -5, 0] },
          transition: { duration: 3, repeat: Infinity },
        };
      default:
        return {};
    }
  };

  return (
    <motion.img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={description}
      className={`${sizeClasses[size]} object-contain`}
      {...getAnimationProps(icon)}
    />
  );
};

export default WeatherIcon;
