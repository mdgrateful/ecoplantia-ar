'use client';

import { useState, useEffect } from 'react';
import styles from './Designer.module.css';

interface WelcomeOverlayProps {
  onDismiss: () => void;
}

interface WaterDrop {
  id: number;
  x: number;
  delay: number;
}

export default function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const [visible, setVisible] = useState(true);
  const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);

  useEffect(() => {
    // Create water drops
    const drops: WaterDrop[] = [];
    for (let i = 0; i < 20; i++) {
      drops.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
      });
    }
    setWaterDrops(drops);

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Wait for fade animation
  };

  return (
    <div
      className={`${styles.welcomeOverlay} ${!visible ? styles.fadeOut : ''}`}
      onClick={handleDismiss}
    >
      {/* Water drops animation */}
      {waterDrops.map(drop => (
        <div
          key={drop.id}
          className={styles.waterDrop}
          style={{
            left: `${drop.x}%`,
            animationDelay: `${drop.delay}s`,
          }}
        >
          💧
        </div>
      ))}

      {/* Welcome content */}
      <div className={styles.welcomeContent}>
        <div className={styles.welcomeIcon}>🌱</div>
        <h1 className={styles.welcomeTitle}>Welcome to Garden Designer</h1>
        <p className={styles.welcomeSubtitle}>
          Create your perfect native plant garden in minutes
        </p>
        <div className={styles.welcomeFeatures}>
          <div className={styles.welcomeFeature}>
            <span>🎯</span>
            <span>Drag & drop plants</span>
          </div>
          <div className={styles.welcomeFeature}>
            <span>🦋</span>
            <span>Support pollinators</span>
          </div>
          <div className={styles.welcomeFeature}>
            <span>📸</span>
            <span>Visualize your space</span>
          </div>
        </div>
        <button className={styles.welcomeBtn} onClick={handleDismiss}>
          Let's Get Started! 🌿
        </button>
        <p className={styles.tapHint}>Tap anywhere to continue</p>
      </div>
    </div>
  );
}
