'use client';

import { useDesigner } from '@/lib/designer-context';
import styles from './Designer.module.css';

export default function SetupPanel() {
  const { state, dispatch } = useDesigner();

  const handleStartDesign = () => {
    if (state.shape === 'polygon') {
      dispatch({ type: 'START_POLYGON' });
    }
    dispatch({ type: 'SET_VIEW', view: 'design' });
  };

  const calcArea = () => {
    if (state.shape === 'circle') {
      const diameter = Math.min(state.widthFt, state.depthFt);
      return Math.PI * Math.pow(diameter / 2, 2);
    }
    return state.widthFt * state.depthFt;
  };

  return (
    <div className={styles.setupPanel}>
      <div className={styles.setupTitle}>Create Your Garden</div>
      <div className={styles.setupSub}>Set your garden shape and dimensions</div>

      {/* Shape Selection */}
      <div className={styles.frmGrp}>
        <label>Garden Shape</label>
        <div className={styles.shapeRow}>
          <button
            type="button"
            className={`${styles.shapeBtn} ${state.shape === 'rectangle' ? styles.sel : ''}`}
            onClick={() => dispatch({ type: 'SET_SHAPE', shape: 'rectangle' })}
          >
            <svg viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="24" strokeWidth="2" rx="2" />
            </svg>
            <span>Rectangle</span>
          </button>
          <button
            type="button"
            className={`${styles.shapeBtn} ${state.shape === 'circle' ? styles.sel : ''}`}
            onClick={() => dispatch({ type: 'SET_SHAPE', shape: 'circle' })}
          >
            <svg viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="16" strokeWidth="2" />
            </svg>
            <span>Circle</span>
          </button>
          <button
            type="button"
            className={`${styles.shapeBtn} ${state.shape === 'polygon' ? styles.sel : ''}`}
            onClick={() => dispatch({ type: 'SET_SHAPE', shape: 'polygon' })}
          >
            <svg viewBox="0 0 40 40" fill="none">
              <path d="M20 4 L36 14 L32 32 L8 32 L4 14 Z" strokeWidth="2" />
            </svg>
            <span>Custom</span>
          </button>
        </div>
      </div>

      {/* Dimensions - only for rectangle/circle */}
      {state.shape !== 'polygon' && (
        <>
          <div className={styles.szRow}>
            <div className={styles.frmGrp}>
              <label>Width (ft)</label>
              <div className={styles.stepperWrap}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => dispatch({ type: 'SET_DIMENSIONS', width: Math.max(2, state.widthFt - 1), depth: state.depthFt })}
                >
                  −
                </button>
                <input
                  type="number"
                  className={styles.stepperInput}
                  value={state.widthFt}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 2;
                    dispatch({ type: 'SET_DIMENSIONS', width: Math.max(2, Math.min(20, val)), depth: state.depthFt });
                  }}
                  min={2}
                  max={20}
                />
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => dispatch({ type: 'SET_DIMENSIONS', width: Math.min(20, state.widthFt + 1), depth: state.depthFt })}
                >
                  +
                </button>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={2}
                max={20}
                value={state.widthFt}
                onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', width: parseInt(e.target.value), depth: state.depthFt })}
              />
            </div>
            <div className={styles.frmGrp}>
              <label>Depth (ft)</label>
              <div className={styles.stepperWrap}>
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => dispatch({ type: 'SET_DIMENSIONS', width: state.widthFt, depth: Math.max(2, state.depthFt - 1) })}
                >
                  −
                </button>
                <input
                  type="number"
                  className={styles.stepperInput}
                  value={state.depthFt}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 2;
                    dispatch({ type: 'SET_DIMENSIONS', width: state.widthFt, depth: Math.max(2, Math.min(20, val)) });
                  }}
                  min={2}
                  max={20}
                />
                <button
                  type="button"
                  className={styles.stepBtn}
                  onClick={() => dispatch({ type: 'SET_DIMENSIONS', width: state.widthFt, depth: Math.min(20, state.depthFt + 1) })}
                >
                  +
                </button>
              </div>
              <input
                type="range"
                className={styles.slider}
                min={2}
                max={20}
                value={state.depthFt}
                onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', width: state.widthFt, depth: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.sizePreview}>
            <div className={styles.previewSize}>
              {state.widthFt} × {state.depthFt} ft
            </div>
            <div className={styles.previewArea}>
              ≈ {calcArea().toFixed(1)} sq ft
            </div>
          </div>
        </>
      )}

      {/* Polygon info */}
      {state.shape === 'polygon' && (
        <div className={styles.card}>
          <h3>Custom Shape</h3>
          <p>You'll draw your custom garden boundary by tapping to place points. Tap near the first point to close the shape.</p>
        </div>
      )}

      <button
        type="button"
        className={styles.mainBtn}
        onClick={handleStartDesign}
      >
        Start Designing →
      </button>
    </div>
  );
}
