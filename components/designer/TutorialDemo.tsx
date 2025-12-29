'use client';

import { useState, useEffect, useRef } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

interface TutorialDemoProps {
  onComplete: () => void;
}

export default function TutorialDemo({ onComplete }: TutorialDemoProps) {
  const { state } = useDesigner();
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'placing' | 'done'>('idle');
  const [position, setPosition] = useState({ x: 50, y: 85 }); // Start from tray area
  const [plantScale, setPlantScale] = useState(0.8);
  const [showRipple, setShowRipple] = useState(false);
  const demoPlant = PLANTS[4]; // Purple Coneflower
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Start demo after a short delay
    const startTimer = setTimeout(() => {
      setPhase('dragging');
      animateDrag();
    }, 500);

    return () => {
      clearTimeout(startTimer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animateDrag = () => {
    const duration = 2000; // 2 seconds to drag
    const startX = 50;
    const startY = 85;
    const endX = 50;
    const endY = 40;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth movement
      const eased = 1 - Math.pow(1 - progress, 3);

      const currentX = startX + (endX - startX) * eased;
      const currentY = startY + (endY - startY) * eased;

      setPosition({ x: currentX, y: currentY });
      setPlantScale(0.8 + 0.4 * eased); // Scale up as it moves

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('placing');
        setShowRipple(true);

        // Complete after showing placement
        setTimeout(() => {
          setPhase('done');
          setTimeout(onComplete, 500);
        }, 1000);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  if (phase === 'done') return null;

  return (
    <div className={styles.tutorialOverlay}>
      {/* Demo instruction */}
      <div className={styles.tutorialText}>
        {phase === 'idle' && 'Watch how it works...'}
        {phase === 'dragging' && '👆 Drag plants from the tray...'}
        {phase === 'placing' && '✨ Drop to place in your garden!'}
      </div>

      {/* Animated plant */}
      <div
        className={`${styles.tutorialPlant} ${phase === 'placing' ? styles.placed : ''}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: `translate(-50%, -50%) scale(${plantScale})`,
        }}
      >
        <div className={styles.tutorialPlantInner}>
          <span>{demoPlant.acr}</span>
        </div>
        {/* Finger indicator */}
        {phase === 'dragging' && (
          <div className={styles.fingerIndicator}>
            👆
          </div>
        )}
      </div>

      {/* Ripple effect on placement */}
      {showRipple && (
        <div
          className={styles.placementRipple}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
          }}
        />
      )}

      {/* Skip button */}
      <button
        className={styles.skipTutorial}
        onClick={onComplete}
      >
        Skip Tutorial
      </button>
    </div>
  );
}
