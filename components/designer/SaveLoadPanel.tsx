'use client';

import { useState, useEffect, useRef } from 'react';
import { useDesigner } from '@/lib/designer-context';
import {
  SavedDesign,
  getLocalDesigns,
  saveDesignLocal,
  deleteDesignLocal,
  syncToCloud,
  createShareLink,
  downloadDesignJSON,
  importDesignJSON,
} from '@/lib/design-storage';
import styles from './Designer.module.css';

interface SaveLoadPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (design: SavedDesign) => void;
}

export default function SaveLoadPanel({ isOpen, onClose, onLoad }: SaveLoadPanelProps) {
  const { state } = useDesigner();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [saveName, setSaveName] = useState('');
  const [activeTab, setActiveTab] = useState<'save' | 'load' | 'share'>('save');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDesigns(getLocalDesigns());
      setSaveName(`Garden ${new Date().toLocaleDateString()}`);
      setShareUrl(null);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!saveName.trim()) return;

    setIsSaving(true);

    const design: SavedDesign = {
      id: `design-${Date.now()}`,
      name: saveName.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shape: state.shape,
      widthFt: state.widthFt,
      depthFt: state.depthFt,
      polyPts: state.polyPts,
      plants: state.plants,
      photoUrl: state.photoUrl || undefined,
      beautyRenderUrl: state.beautyRenderUrl || undefined,
      synced: false,
    };

    // Save locally first
    saveDesignLocal(design);

    // Try to sync to cloud
    const cloudResult = await syncToCloud(design);
    if (cloudResult.success) {
      design.cloudJobId = cloudResult.jobId;
      design.synced = true;
      saveDesignLocal(design);
    }

    setDesigns(getLocalDesigns());
    setIsSaving(false);
    setSaveName('');

    alert(cloudResult.success ? 'Saved to cloud!' : 'Saved locally');
  };

  const handleLoad = (design: SavedDesign) => {
    onLoad(design);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this design?')) {
      deleteDesignLocal(id);
      setDesigns(getLocalDesigns());
    }
  };

  const handleShare = async () => {
    setIsSharing(true);

    const design: SavedDesign = {
      id: `shared-${Date.now()}`,
      name: saveName.trim() || `Garden ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shape: state.shape,
      widthFt: state.widthFt,
      depthFt: state.depthFt,
      polyPts: state.polyPts,
      plants: state.plants,
      photoUrl: state.photoUrl || undefined,
    };

    const url = await createShareLink(design);
    setShareUrl(url);
    setIsSharing(false);
  };

  const handleExportJSON = () => {
    const design: SavedDesign = {
      id: `export-${Date.now()}`,
      name: saveName.trim() || 'Exported Design',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shape: state.shape,
      widthFt: state.widthFt,
      depthFt: state.depthFt,
      polyPts: state.polyPts,
      plants: state.plants,
    };
    downloadDesignJSON(design);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const design = importDesignJSON(json);
      if (design) {
        saveDesignLocal(design);
        setDesigns(getLocalDesigns());
        alert('Design imported!');
      } else {
        alert('Invalid design file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const copyShareUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>My Designs</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* Tabs */}
        <div className={styles.tabBar}>
          {(['save', 'load', 'share'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'save' ? 'Save' : tab === 'load' ? 'Load' : 'Share'}
            </button>
          ))}
        </div>

        <div className={styles.modalBody}>
          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className={styles.saveSection}>
              <div className={styles.inputGroup}>
                <label>Design Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="My Garden Design"
                />
              </div>

              <div className={styles.saveInfo}>
                <div className={styles.infoRow}>
                  <span>Plants:</span>
                  <strong>{state.plants.length}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Size:</span>
                  <strong>{state.widthFt} × {state.depthFt} ft</strong>
                </div>
              </div>

              <button
                className={styles.primaryBtn}
                onClick={handleSave}
                disabled={isSaving || !saveName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Design'}
              </button>

              <div className={styles.exportBtns}>
                <button className={styles.secondaryBtn} onClick={handleExportJSON}>
                  Export JSON
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Import JSON
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Load Tab */}
          {activeTab === 'load' && (
            <div className={styles.loadSection}>
              {designs.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No saved designs yet.</p>
                  <p>Save your current design to see it here.</p>
                </div>
              ) : (
                <div className={styles.designList}>
                  {designs.map(design => (
                    <div key={design.id} className={styles.designCard}>
                      <div className={styles.designInfo}>
                        <h3>{design.name}</h3>
                        <p>
                          {design.plants.length} plants · {design.widthFt}×{design.depthFt} ft
                        </p>
                        <p className={styles.date}>
                          {new Date(design.updatedAt).toLocaleDateString()}
                          {design.synced && <span className={styles.syncBadge}>☁️</span>}
                        </p>
                      </div>
                      <div className={styles.designActions}>
                        <button
                          className={styles.loadBtn}
                          onClick={() => handleLoad(design)}
                        >
                          Load
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(design.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Share Tab */}
          {activeTab === 'share' && (
            <div className={styles.shareSection}>
              <p className={styles.shareDesc}>
                Create a link to share your garden design with friends, family, or on social media.
              </p>

              {!shareUrl ? (
                <button
                  className={styles.primaryBtn}
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? 'Creating Link...' : 'Create Share Link'}
                </button>
              ) : (
                <div className={styles.shareResult}>
                  <div className={styles.shareUrl}>
                    <input type="text" value={shareUrl} readOnly />
                    <button onClick={copyShareUrl}>Copy</button>
                  </div>
                  <p className={styles.shareNote}>Link expires in 30 days</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
