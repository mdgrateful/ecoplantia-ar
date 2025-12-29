'use client';

import styles from './Designer.module.css';

interface PlantControlsProps {
  onDuplicate: () => void;
  onDelete: () => void;
  onDeselect: () => void;
}

export default function PlantControls({ onDuplicate, onDelete, onDeselect }: PlantControlsProps) {
  return (
    <div className={styles.plantControls}>
      <button className={styles.plantControlBtn} onClick={onDuplicate}>
        <span className="icon">📋</span>
        <span className="label">Duplicate</span>
      </button>

      <button className={styles.plantControlBtn} onClick={onDeselect}>
        <span className="icon">✓</span>
        <span className="label">Deselect</span>
      </button>

      <button className={`${styles.plantControlBtn} ${styles.danger}`} onClick={onDelete}>
        <span className="icon">🗑️</span>
        <span className="label">Delete</span>
      </button>
    </div>
  );
}
