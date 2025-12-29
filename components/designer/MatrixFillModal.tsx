'use client';

import { useState } from 'react';
import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

interface MatrixFillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FillPattern = 'grid' | 'hex' | 'random' | 'rows';

export default function MatrixFillModal({ isOpen, onClose }: MatrixFillModalProps) {
  const { state, dispatch } = useDesigner();
  const [selectedPlants, setSelectedPlants] = useState<number[]>([0, 4]); // Default: Coreopsis, Coneflower
  const [pattern, setPattern] = useState<FillPattern>('hex');
  const [density, setDensity] = useState<number>(100); // Percentage of normal spacing

  const FT = 40; // pixels per foot

  const togglePlant = (idx: number) => {
    if (selectedPlants.includes(idx)) {
      setSelectedPlants(prev => prev.filter(i => i !== idx));
    } else if (selectedPlants.length < 5) {
      setSelectedPlants(prev => [...prev, idx]);
    }
  };

  const generateFill = () => {
    if (selectedPlants.length === 0) return;

    const plants = selectedPlants.map(idx => PLANTS[idx]).filter(p => !p.isBlank);
    if (plants.length === 0) return;

    // Calculate garden bounds
    const gW = state.widthFt * FT;
    const gH = state.depthFt * FT;

    // Get average plant size for spacing
    const avgSize = plants.reduce((sum, p) => sum + p.size, 0) / plants.length;
    const baseSpacing = (avgSize / 12) * FT * (density / 100);

    const newPlants: Array<{ id: string; idx: number; name: string; cx: number; cy: number }> = [];
    let plantIdx = 0;

    // Generate points based on pattern
    const points: Array<{ x: number; y: number }> = [];

    switch (pattern) {
      case 'grid':
        for (let y = baseSpacing; y < gH - baseSpacing / 2; y += baseSpacing) {
          for (let x = baseSpacing; x < gW - baseSpacing / 2; x += baseSpacing) {
            points.push({ x, y });
          }
        }
        break;

      case 'hex':
        let row = 0;
        for (let y = baseSpacing; y < gH - baseSpacing / 2; y += baseSpacing * 0.866) {
          const offset = row % 2 === 0 ? 0 : baseSpacing / 2;
          for (let x = baseSpacing + offset; x < gW - baseSpacing / 2; x += baseSpacing) {
            points.push({ x, y });
          }
          row++;
        }
        break;

      case 'random':
        const count = Math.floor((gW * gH) / (baseSpacing * baseSpacing * 1.2));
        for (let i = 0; i < count; i++) {
          const x = baseSpacing + Math.random() * (gW - 2 * baseSpacing);
          const y = baseSpacing + Math.random() * (gH - 2 * baseSpacing);
          // Check minimum distance from existing points
          const tooClose = points.some(p => Math.hypot(p.x - x, p.y - y) < baseSpacing * 0.7);
          if (!tooClose) {
            points.push({ x, y });
          }
        }
        break;

      case 'rows':
        let currentRow = 0;
        for (let y = baseSpacing; y < gH - baseSpacing / 2; y += baseSpacing) {
          const rowPlant = plants[currentRow % plants.length];
          for (let x = baseSpacing; x < gW - baseSpacing / 2; x += baseSpacing) {
            points.push({ x, y });
          }
          currentRow++;
        }
        break;
    }

    // Create plants at points
    points.forEach((pt, i) => {
      const plant = plants[plantIdx % plants.length];
      const plantData = PLANTS.findIndex(p => p.acr === plant.acr);

      newPlants.push({
        id: `fill-${Date.now()}-${i}`,
        idx: plantData,
        name: plant.name,
        cx: pt.x,
        cy: pt.y,
      });

      // For row pattern, only increment at end of row
      if (pattern !== 'rows') {
        plantIdx++;
      }
    });

    // Add all plants
    newPlants.forEach(plant => {
      dispatch({ type: 'PLACE_PLANT', plant });
    });

    dispatch({ type: 'SHOW_TOAST', message: `Added ${newPlants.length} plants!` });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Matrix Fill</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {/* Pattern Selection */}
          <div className={styles.formGroup}>
            <label>Fill Pattern</label>
            <div className={styles.patternGrid}>
              {[
                { id: 'hex', label: 'Honeycomb', icon: '⬡' },
                { id: 'grid', label: 'Grid', icon: '▦' },
                { id: 'random', label: 'Natural', icon: '✿' },
                { id: 'rows', label: 'Rows', icon: '≡' },
              ].map(p => (
                <button
                  key={p.id}
                  className={`${styles.patternBtn} ${pattern === p.id ? styles.active : ''}`}
                  onClick={() => setPattern(p.id as FillPattern)}
                >
                  <span className={styles.patternIcon}>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Density Slider */}
          <div className={styles.formGroup}>
            <label>
              Density: {density}%
              <span className={styles.hint}>
                {density < 80 ? '(Sparse)' : density > 120 ? '(Dense)' : '(Normal)'}
              </span>
            </label>
            <input
              type="range"
              min="60"
              max="140"
              value={density}
              onChange={e => setDensity(parseInt(e.target.value))}
              className={styles.slider}
            />
          </div>

          {/* Plant Selection */}
          <div className={styles.formGroup}>
            <label>Select Plants (up to 5)</label>
            <div className={styles.plantSelectGrid}>
              {PLANTS.filter(p => !p.isBlank).map((plant, idx) => (
                <button
                  key={plant.acr}
                  className={`${styles.plantSelectBtn} ${selectedPlants.includes(idx) ? styles.selected : ''}`}
                  onClick={() => togglePlant(idx)}
                  style={{
                    borderColor: selectedPlants.includes(idx) ? plant.bloomColor : undefined,
                  }}
                >
                  <span className={styles.plantAcr}>{plant.acr}</span>
                  <span className={styles.plantName}>{plant.name.split(' ')[0]}</span>
                  {plant.isKeystone && <span className={styles.keystoneStar}>★</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className={styles.fillPreview}>
            <p>
              Selected: {selectedPlants.length} plant{selectedPlants.length !== 1 ? 's' : ''}
            </p>
            <p>
              Garden: {state.widthFt} × {state.depthFt} ft ({state.widthFt * state.depthFt} sq ft)
            </p>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button className={styles.secondaryBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.primaryBtn}
              onClick={generateFill}
              disabled={selectedPlants.length === 0}
            >
              Fill Garden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
