'use client';

import { useDesigner } from '@/lib/designer-context';
import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

interface PlantTrayProps {
  onShowDetail?: (idx: number) => void;
}

export default function PlantTray({ onShowDetail }: PlantTrayProps) {
  const { state, dispatch } = useDesigner();

  const handlePlantClick = (idx: number) => {
    dispatch({ type: 'SELECT_PLANT', idx });
  };

  const handlePlantLongPress = (idx: number) => {
    if (onShowDetail && !PLANTS[idx].isBlank) {
      onShowDetail(idx);
    }
  };

  return (
    <div className={`${styles.plantTray} ${state.trayCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.trayHead}>
        <span>PLANT PALETTE — Tap to select, hold for info</span>
        <button
          className={styles.collapseBtn}
          onClick={() => dispatch({ type: 'TOGGLE_TRAY' })}
        >
          {state.trayCollapsed ? '+' : '-'}
        </button>
      </div>
      <div className={styles.trayList}>
        {PLANTS.map((plant, idx) => (
          <div
            key={plant.acr}
            className={`${styles.pItem} ${state.selectedPlantIdx === idx ? styles.sel : ''} ${plant.isBlank ? styles.toolbox : ''}`}
            onClick={() => handlePlantClick(idx)}
            onContextMenu={(e) => {
              e.preventDefault();
              handlePlantLongPress(idx);
            }}
            onTouchStart={(e) => {
              const timer = setTimeout(() => handlePlantLongPress(idx), 500);
              const clear = () => clearTimeout(timer);
              e.currentTarget.addEventListener('touchend', clear, { once: true });
              e.currentTarget.addEventListener('touchmove', clear, { once: true });
            }}
          >
            {plant.isBlank ? (
              <div className={styles.ico} style={{ background: '#999', color: '#fff', border: 'none' }}>
                T
              </div>
            ) : (
              <div
                className={styles.ico}
                style={{
                  borderColor: plant.bloomColor || '#1B9E31',
                  background: plant.isKeystone ? '#FFF9C4' : '#fff',
                }}
              >
                {plant.acr}
              </div>
            )}
            <div className={styles.lbl}>
              {plant.isBlank ? 'Blank' : plant.name.split(' ')[0]}
            </div>
            {plant.isKeystone && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                fontSize: '8px',
              }}>
                *
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
