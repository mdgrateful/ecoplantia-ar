'use client';

import { PlacedPlant, Point, GardenShape } from './designer-context';

// Design data structure for persistence
export interface SavedDesign {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  // Garden setup
  shape: GardenShape;
  widthFt: number;
  depthFt: number;
  polyPts: Point[];

  // Plants
  plants: PlacedPlant[];

  // Photo/Mockup
  photoUrl?: string;
  beautyRenderUrl?: string;

  // Metadata
  thumbnail?: string;
  cloudJobId?: string;
  synced?: boolean;
}

const STORAGE_KEY = 'ecoplantia-designs';
const CURRENT_DESIGN_KEY = 'ecoplantia-current-design';

// ========== LOCAL STORAGE ==========

export function getLocalDesigns(): SavedDesign[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveDesignLocal(design: SavedDesign): void {
  if (typeof window === 'undefined') return;
  try {
    const designs = getLocalDesigns();
    const idx = designs.findIndex(d => d.id === design.id);

    design.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      designs[idx] = design;
    } else {
      designs.unshift(design);
    }

    // Keep max 20 designs locally
    const trimmed = designs.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save design:', e);
  }
}

export function deleteDesignLocal(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const designs = getLocalDesigns();
    const filtered = designs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete design:', e);
  }
}

export function getDesignById(id: string): SavedDesign | null {
  const designs = getLocalDesigns();
  return designs.find(d => d.id === id) || null;
}

// Current working design
export function getCurrentDesign(): SavedDesign | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CURRENT_DESIGN_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentDesign(design: SavedDesign | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (design) {
      localStorage.setItem(CURRENT_DESIGN_KEY, JSON.stringify(design));
    } else {
      localStorage.removeItem(CURRENT_DESIGN_KEY);
    }
  } catch (e) {
    console.error('Failed to set current design:', e);
  }
}

// ========== CLOUD SYNC (Supabase) ==========

export async function syncToCloud(design: SavedDesign): Promise<{ success: boolean; jobId?: string }> {
  try {
    const response = await fetch('/api/design/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        design,
        jobId: design.cloudJobId,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Update local with cloud job ID
      design.cloudJobId = data.jobId;
      design.synced = true;
      saveDesignLocal(design);
      return { success: true, jobId: data.jobId };
    }

    return { success: false };
  } catch (e) {
    console.error('Cloud sync failed:', e);
    return { success: false };
  }
}

export async function loadFromCloud(jobId: string): Promise<SavedDesign | null> {
  try {
    const response = await fetch(`/api/design/${jobId}`);
    const data = await response.json();

    if (data.success && data.design) {
      return data.design;
    }

    return null;
  } catch (e) {
    console.error('Cloud load failed:', e);
    return null;
  }
}

// ========== SHARE LINK ==========

export function generateShareId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function createShareLink(design: SavedDesign): Promise<string | null> {
  try {
    const response = await fetch('/api/design/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ design }),
    });

    const data = await response.json();
    return data.success ? data.shareUrl : null;
  } catch {
    return null;
  }
}

// ========== EXPORT UTILITIES ==========

export function designToJSON(design: SavedDesign): string {
  return JSON.stringify(design, null, 2);
}

export function downloadDesignJSON(design: SavedDesign): void {
  const json = designToJSON(design);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.name.replace(/\s+/g, '-').toLowerCase()}-design.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importDesignJSON(json: string): SavedDesign | null {
  try {
    const design = JSON.parse(json) as SavedDesign;
    // Generate new ID to avoid conflicts
    design.id = `imported-${Date.now()}`;
    design.createdAt = new Date().toISOString();
    design.updatedAt = new Date().toISOString();
    design.synced = false;
    return design;
  } catch {
    return null;
  }
}

// ========== AUTO-SAVE ==========

let autoSaveTimeout: NodeJS.Timeout | null = null;

export function scheduleAutoSave(design: SavedDesign, delay = 2000): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  autoSaveTimeout = setTimeout(() => {
    saveDesignLocal(design);
    setCurrentDesign(design);
  }, delay);
}

export function cancelAutoSave(): void {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = null;
  }
}
