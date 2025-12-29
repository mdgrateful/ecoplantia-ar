'use client';

import { useDesigner } from '@/lib/designer-context';
import styles from './Designer.module.css';

export default function ControlBar() {
  const { state, dispatch } = useDesigner();

  return (
    <div className={styles.ctrlBar}>
      <div className={styles.ctrlGrp}>
        <label>
          <input
            type="checkbox"
            className={styles.ctrlChk}
            checked={state.showGrid}
            onChange={() => dispatch({ type: 'TOGGLE_GRID' })}
          />
          <span className={styles.ctrlLabel}>Grid</span>
        </label>
        <label>
          <input
            type="checkbox"
            className={styles.ctrlChk}
            checked={state.allowOverlap}
            onChange={() => dispatch({ type: 'TOGGLE_OVERLAP' })}
          />
          <span className={styles.ctrlLabel}>Overlap</span>
        </label>
        <label>
          <input
            type="checkbox"
            className={styles.ctrlChk}
            checked={state.showPlantImages}
            onChange={() => dispatch({ type: 'TOGGLE_PLANT_IMAGES' })}
          />
          <span className={styles.ctrlLabel}>Images</span>
        </label>
      </div>

      <div className={styles.zoomGrp}>
        <button
          className={styles.zBtn}
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom - 0.25 })}
        >
          −
        </button>
        <span className={styles.zoomLvl}>{Math.round(state.zoom * 100)}%</span>
        <button
          className={styles.zBtn}
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: state.zoom + 0.25 })}
        >
          +
        </button>
        <button
          className={styles.zBtn}
          onClick={() => dispatch({ type: 'SET_ZOOM', zoom: 1 })}
          style={{ fontSize: '10px' }}
        >
          ⟳
        </button>
      </div>
    </div>
  );
}
