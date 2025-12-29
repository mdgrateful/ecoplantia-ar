'use client';

import { PLANTS } from '@/lib/plants';
import styles from './Designer.module.css';

interface PlantDetailPanelProps {
  plantIdx: number | null;
  onClose: () => void;
}

export default function PlantDetailPanel({ plantIdx, onClose }: PlantDetailPanelProps) {
  if (plantIdx === null) return null;

  const plant = PLANTS[plantIdx];
  if (!plant || plant.isBlank) return null;

  return (
    <div className={`${styles.plantDetailPanel} ${plantIdx !== null ? styles.open : ''}`}>
      <div className={styles.plantDetailHeader}>
        <div className={styles.plantDetailTitle}>
          <div className={styles.plantDetailIcon}>
            {plant.acr}
          </div>
          <div className={styles.plantDetailName}>
            <h3>{plant.name}</h3>
            <p>{plant.sciName}</p>
          </div>
        </div>
        <button className={styles.plantDetailClose} onClick={onClose}>
          ×
        </button>
      </div>

      <div className={styles.plantDetailBody}>
        {/* Gallery */}
        {plant.gallery.length > 0 && (
          <div className={styles.plantDetailGallery}>
            {plant.gallery.map((img, i) => (
              <img key={i} src={img} alt={`${plant.name} ${i + 1}`} />
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className={styles.plantDetailStats}>
          <div className={styles.plantDetailStat}>
            <div className="label">Light</div>
            <div className="value">{plant.light}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Water</div>
            <div className="value">{plant.water}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Zone</div>
            <div className="value">{plant.zone}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Bloom</div>
            <div className="value">{plant.bloom}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Height</div>
            <div className="value">{plant.height}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Spread</div>
            <div className="value">{plant.spread}</div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Color</div>
            <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: plant.bloomColor,
                  border: '1px solid #ddd',
                }}
              />
            </div>
          </div>
          <div className={styles.plantDetailStat}>
            <div className="label">Type</div>
            <div className="value">{plant.isGrass ? 'Grass' : 'Flower'}</div>
          </div>
        </div>

        {/* Keystone Badge */}
        {plant.isKeystone && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
            border: '1px solid #FFD54F',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>⭐</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '11px', color: '#F57F17' }}>Keystone Species</div>
              <div style={{ fontSize: '9px', color: '#795548' }}>Supports 90% of butterfly caterpillars!</div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className={styles.plantDetailSection}>
          <h4>About</h4>
          <p>{plant.desc}</p>
        </div>

        {/* Care */}
        <div className={styles.plantDetailSection}>
          <h4>Care Tips</h4>
          <p>{plant.care}</p>
        </div>

        {/* Wildlife */}
        <div className={styles.plantDetailSection}>
          <h4>Wildlife Value</h4>
          <p>{plant.wildlife}</p>
        </div>
      </div>
    </div>
  );
}
