'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  return (
    <motion.nav 
      className={styles.navbar}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.navContent}>
        <motion.h1 
          className={styles.logo}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          aria-label="Weather Companion Logo"
        >
          {/* Logo image from an online URL */}
          <motion.img
            src="https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=48&q=80"
            alt="Weather icon"
            width={32}
            height={32}
            initial={{ rotate: 0 }}
            whileHover={{ rotate: 15 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />
          Weather Companion 🌤
        </motion.h1>
      </div>
    </motion.nav>
  );
};

export default Navbar;
