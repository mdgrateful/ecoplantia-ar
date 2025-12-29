'use client';

import { useDesigner } from '@/lib/designer-context';
import { PLANTS, MONTHS, parseBloomPeriod } from '@/lib/plants';
import styles from './Designer.module.css';

export default function SummaryPanel() {
  const { state, getPlantCounts, getGardenArea, getCoverage, getSpeciesCount, getKeystoneCount } = useDesigner();

  const counts = getPlantCounts();
  const area = getGardenArea();
  const coverage = getCoverage();
  const speciesCount = getSpeciesCount();
  const keystoneCount = getKeystoneCount();

  const handleSavePNG = async () => {
    // Implementation would capture canvas and generate downloadable PNG
    alert('Save functionality coming soon!');
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <h2>Garden Summary</h2>
      </div>

      <div className={styles.panelBody}>
        {/* Stats Grid */}
        <div className={styles.card}>
          <h3>📊 Overview</h3>
          <div className={styles.statGrid}>
            <div className={styles.statBox}>
              <div className={styles.val}>{Math.round(area)}</div>
              <div className={styles.lbl}>Sq Ft</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.val}>{state.plants.length}</div>
              <div className={styles.lbl}>Plants</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.val}>{speciesCount}</div>
              <div className={styles.lbl}>Species</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.val}>{coverage}%</div>
              <div className={styles.lbl}>Coverage</div>
            </div>
          </div>
        </div>

        {/* Plant List */}
        <div className={styles.card}>
          <h3>🌱 Plant List</h3>
          {Object.entries(counts).length > 0 ? (
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const plant = PLANTS.find(p => p.name === name);
                if (!plant) return null;

                return (
                  <div key={name} className={styles.pRow}>
                    <div className={styles.dot}>{plant.acr}</div>
                    <div className={styles.info}>
                      <div className={styles.nm}>{name}</div>
                      <div className={styles.sz}>{plant.size}" spread</div>
                    </div>
                    <div className={styles.cnt}>×{count}</div>
                  </div>
                );
              })
          ) : (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '10px' }}>
              No plants yet
            </p>
          )}
        </div>

        {/* Bloom Calendar */}
        <div className={styles.card}>
          <h3>🌸 Bloom Calendar</h3>
          {/* Header */}
          <div className={styles.bloomRow} style={{ marginBottom: '6px' }}>
            <div className={styles.bloomLabel}></div>
            {MONTHS.map(m => (
              <div key={m} style={{ fontSize: '6px', textAlign: 'center', color: '#666' }}>{m}</div>
            ))}
          </div>
          {/* Rows */}
          {Object.entries(counts).length > 0 ? (
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const plant = PLANTS.find(p => p.name === name);
                if (!plant) return null;

                const bloomMonths = parseBloomPeriod(plant.bloom);

                return (
                  <div key={name} className={styles.bloomRow}>
                    <div className={styles.bloomLabel}>{plant.acr} (×{count})</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <div
                        key={m}
                        className={`${styles.bloomCell} ${bloomMonths.includes(m) ? styles.active : ''}`}
                      />
                    ))}
                  </div>
                );
              })
          ) : (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '10px' }}>
              Add plants to see bloom periods
            </p>
          )}
        </div>

        {/* Keystone Info */}
        <div className={styles.card}>
          <h3>🦋 Keystone Species</h3>
          <p>
            {keystoneCount > 0
              ? `You have ${keystoneCount} keystone species that support native wildlife!`
              : 'Add keystone species like Black-Eyed Susan, Coneflower, or Butterfly Weed to support pollinators.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
            {PLANTS.filter(p => p.isKeystone).map(p => {
              const isUsed = Object.keys(counts).includes(p.name);
              return (
                <span
                  key={p.acr}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '8px',
                    fontWeight: 'bold',
                    background: isUsed ? 'var(--primary-light)' : '#f0f0f0',
                    color: isUsed ? 'var(--primary)' : '#999',
                    border: isUsed ? '1px solid var(--primary)' : '1px solid #ddd',
                  }}
                >
                  {isUsed ? '✓ ' : ''}{p.acr}
                </span>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          className={styles.mainBtn}
          onClick={handleSavePNG}
          style={{ marginTop: '8px' }}
        >
          💾 Save Plan as PNG
        </button>
      </div>
    </div>
  );
}
