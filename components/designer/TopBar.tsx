'use client';

import { useDesigner } from '@/lib/designer-context';
import styles from './Designer.module.css';

interface TopBarProps {
  onOpenSaveLoad?: () => void;
  onOpenMatrixFill?: () => void;
}

export default function TopBar({ onOpenSaveLoad, onOpenMatrixFill }: TopBarProps) {
  const { state, dispatch } = useDesigner();

  const handleScreenZoom = (delta: number) => {
    dispatch({ type: 'SET_SCREEN_ZOOM', zoom: state.screenZoom + delta });
  };

  const handleNewDesign = () => {
    if (state.dirty && !confirm('Discard current design?')) return;
    dispatch({ type: 'NEW_DESIGN' });
  };

  return (
    <header className={styles.topBar}>
      <img
        src="https://static.wixstatic.com/media/94bd1f_221f30cd2cd24559a6075cbc06f95f0a~mv2.png"
        alt="Ecoplantia"
        style={{ height: '18px' }}
      />

      <div className={styles.topBtnGroup}>
        {state.view !== 'setup' && (
          <>
            <button
              className={styles.topBtn}
              onClick={() => dispatch({ type: 'UNDO' })}
              disabled={state.undoStack.length === 0}
              title="Undo"
            >
              ↩
            </button>
            <button
              className={styles.topBtn}
              onClick={handleNewDesign}
              title="New Design"
            >
              New
            </button>
            <button
              className={styles.topBtn}
              onClick={onOpenSaveLoad}
              title="Save / Load"
            >
              Save
            </button>
            {state.view === 'design' && (
              <button
                className={styles.topBtn}
                onClick={onOpenMatrixFill}
                title="Matrix Fill - Auto-fill garden with plants"
              >
                Fill
              </button>
            )}
          </>
        )}

        <div className={styles.screenZoom}>
          <button
            className={styles.szBtn}
            onClick={() => handleScreenZoom(-0.1)}
          >
            −
          </button>
          <span style={{ fontSize: '8px', minWidth: '28px', textAlign: 'center' }}>
            {Math.round(state.screenZoom * 100)}%
          </span>
          <button
            className={styles.szBtn}
            onClick={() => handleScreenZoom(0.1)}
          >
            +
          </button>
        </div>

        {state.dirty && !state.saved && (
          <span style={{ fontSize: '8px', color: '#ff9800' }}>•</span>
        )}
        {state.saved && (
          <span style={{ fontSize: '8px', color: '#4CAF50' }}>✓</span>
        )}
      </div>
    </header>
  );
}
