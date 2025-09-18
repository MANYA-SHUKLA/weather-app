'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <motion.footer 
      className={styles.footer}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={styles.footerContent}>
        <p className={styles.text}>
          Made with ❤️ by MANYA SHUKLA
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;