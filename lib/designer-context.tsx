'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Plant, PLANTS } from './plants';

// Types
export interface Point {
  x: number;
  y: number;
}

export interface PlacedPlant {
  id: string;
  idx: number;
  name: string;
  cx: number;
  cy: number;
}

export type GardenShape = 'rectangle' | 'circle' | 'polygon';
export type ViewMode = 'setup' | 'design' | 'mockup' | 'summary' | 'purchase';

export interface DesignerState {
  // Garden setup
  shape: GardenShape;
  widthFt: number;
  depthFt: number;

  // Polygon points (for custom shape)
  polyPts: Point[];
  polyDone: boolean;
  polyDrawing: boolean;

  // Plants
  plants: PlacedPlant[];
  selectedPlantIdx: number | null;

  // View state
  view: ViewMode;
  zoom: number;
  screenZoom: number;
  showGrid: boolean;
  allowOverlap: boolean;
  showPlantImages: boolean;
  trayCollapsed: boolean;

  // Garden selection & dragging (v40 feature)
  gardenSelected: boolean;
  vpOffsetX: number;
  vpOffsetY: number;
  showBufferHint: boolean;

  // Undo stack
  undoStack: PlacedPlant[];

  // Save state
  dirty: boolean;
  saved: boolean;

  // Toast message
  toast: string | null;

  // Photo for mockup
  photoUrl: string | null;
  beautyRenderUrl: string | null;
}

// Actions
type DesignerAction =
  | { type: 'SET_SHAPE'; shape: GardenShape }
  | { type: 'SET_DIMENSIONS'; width: number; depth: number }
  | { type: 'SET_VIEW'; view: ViewMode }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_SCREEN_ZOOM'; zoom: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_OVERLAP' }
  | { type: 'TOGGLE_PLANT_IMAGES' }
  | { type: 'TOGGLE_TRAY' }
  | { type: 'SELECT_PLANT'; idx: number | null }
  | { type: 'PLACE_PLANT'; plant: PlacedPlant }
  | { type: 'MOVE_PLANT'; id: string; cx: number; cy: number }
  | { type: 'REMOVE_PLANT'; id: string }
  | { type: 'UNDO' }
  | { type: 'CLEAR_PLANTS' }
  | { type: 'SET_POLY_POINTS'; points: Point[] }
  | { type: 'ADD_POLY_POINT'; point: Point }
  | { type: 'UPDATE_POLY_POINT'; index: number; point: Point }
  | { type: 'FINISH_POLYGON' }
  | { type: 'START_POLYGON' }
  | { type: 'SHOW_TOAST'; message: string }
  | { type: 'HIDE_TOAST' }
  | { type: 'MARK_SAVED' }
  | { type: 'SET_PHOTO_URL'; url: string }
  | { type: 'SET_BEAUTY_RENDER'; url: string }
  | { type: 'NEW_DESIGN' }
  | { type: 'LOAD_DESIGN'; design: { shape: GardenShape; widthFt: number; depthFt: number; polyPts: Point[]; plants: PlacedPlant[]; photoUrl?: string; beautyRenderUrl?: string } }
  | { type: 'TOGGLE_GARDEN_SELECTED'; selected?: boolean }
  | { type: 'SET_VP_OFFSET'; x: number; y: number }
  | { type: 'SHOW_BUFFER_HINT' }
  | { type: 'HIDE_BUFFER_HINT' };

// Initial state
const initialState: DesignerState = {
  shape: 'rectangle',
  widthFt: 8,
  depthFt: 4,
  polyPts: [],
  polyDone: false,
  polyDrawing: false,
  plants: [],
  selectedPlantIdx: 0,
  view: 'setup',
  zoom: 1,
  screenZoom: 1,
  showGrid: false,
  allowOverlap: false,
  showPlantImages: false,
  trayCollapsed: false,
  gardenSelected: false,
  vpOffsetX: 0,
  vpOffsetY: 0,
  showBufferHint: false,
  undoStack: [],
  dirty: false,
  saved: false,
  toast: null,
  photoUrl: null,
  beautyRenderUrl: null,
};

// Reducer
function designerReducer(state: DesignerState, action: DesignerAction): DesignerState {
  switch (action.type) {
    case 'SET_SHAPE':
      return { ...state, shape: action.shape, dirty: true };

    case 'SET_DIMENSIONS':
      return { ...state, widthFt: action.width, depthFt: action.depth, dirty: true };

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.5, Math.min(2, action.zoom)) };

    case 'SET_SCREEN_ZOOM':
      return { ...state, screenZoom: Math.max(0.5, Math.min(1.5, action.zoom)) };

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'TOGGLE_OVERLAP':
      return { ...state, allowOverlap: !state.allowOverlap };

    case 'TOGGLE_PLANT_IMAGES':
      return { ...state, showPlantImages: !state.showPlantImages };

    case 'TOGGLE_TRAY':
      return { ...state, trayCollapsed: !state.trayCollapsed };

    case 'SELECT_PLANT':
      return { ...state, selectedPlantIdx: action.idx };

    case 'PLACE_PLANT':
      return {
        ...state,
        plants: [...state.plants, action.plant],
        undoStack: [...state.undoStack, action.plant],
        dirty: true,
        saved: false,
      };

    case 'MOVE_PLANT':
      return {
        ...state,
        plants: state.plants.map(p =>
          p.id === action.id ? { ...p, cx: action.cx, cy: action.cy } : p
        ),
        dirty: true,
        saved: false,
      };

    case 'REMOVE_PLANT':
      return {
        ...state,
        plants: state.plants.filter(p => p.id !== action.id),
        dirty: true,
        saved: false,
      };

    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      const lastPlant = state.undoStack[state.undoStack.length - 1];
      return {
        ...state,
        plants: state.plants.filter(p => p.id !== lastPlant.id),
        undoStack: state.undoStack.slice(0, -1),
        dirty: true,
        saved: false,
      };

    case 'CLEAR_PLANTS':
      return {
        ...state,
        plants: [],
        undoStack: [],
        dirty: true,
        saved: false,
      };

    case 'SET_POLY_POINTS':
      return { ...state, polyPts: action.points, dirty: true };

    case 'ADD_POLY_POINT':
      return { ...state, polyPts: [...state.polyPts, action.point], dirty: true };

    case 'UPDATE_POLY_POINT':
      return {
        ...state,
        polyPts: state.polyPts.map((p, i) => i === action.index ? action.point : p),
        dirty: true,
      };

    case 'FINISH_POLYGON':
      return { ...state, polyDone: true, polyDrawing: false };

    case 'START_POLYGON':
      return { ...state, polyDrawing: true, polyDone: false, polyPts: [] };

    case 'SHOW_TOAST':
      return { ...state, toast: action.message };

    case 'HIDE_TOAST':
      return { ...state, toast: null };

    case 'MARK_SAVED':
      return { ...state, saved: true, dirty: false };

    case 'SET_PHOTO_URL':
      return { ...state, photoUrl: action.url };

    case 'SET_BEAUTY_RENDER':
      return { ...state, beautyRenderUrl: action.url };

    case 'NEW_DESIGN':
      return {
        ...initialState,
        view: 'setup',
      };

    case 'LOAD_DESIGN':
      return {
        ...state,
        shape: action.design.shape,
        widthFt: action.design.widthFt,
        depthFt: action.design.depthFt,
        polyPts: action.design.polyPts || [],
        polyDone: action.design.shape === 'polygon' && (action.design.polyPts?.length || 0) >= 3,
        polyDrawing: false,
        plants: action.design.plants || [],
        photoUrl: action.design.photoUrl || null,
        beautyRenderUrl: action.design.beautyRenderUrl || null,
        undoStack: [],
        dirty: false,
        saved: true,
        view: 'design',
        gardenSelected: false,
        vpOffsetX: 0,
        vpOffsetY: 0,
      };

    case 'TOGGLE_GARDEN_SELECTED':
      return {
        ...state,
        gardenSelected: action.selected !== undefined ? action.selected : !state.gardenSelected,
      };

    case 'SET_VP_OFFSET':
      return {
        ...state,
        vpOffsetX: action.x,
        vpOffsetY: action.y,
      };

    case 'SHOW_BUFFER_HINT':
      return { ...state, showBufferHint: true };

    case 'HIDE_BUFFER_HINT':
      return { ...state, showBufferHint: false };

    default:
      return state;
  }
}

// Context
interface DesignerContextType {
  state: DesignerState;
  dispatch: React.Dispatch<DesignerAction>;
  plants: Plant[];

  // Helper functions
  getPlantCounts: () => Record<string, number>;
  getGardenArea: () => number;
  getCoverage: () => number;
  getSpeciesCount: () => number;
  getKeystoneCount: () => number;
}

const DesignerContext = createContext<DesignerContextType | null>(null);

// Provider
export function DesignerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(designerReducer, initialState);

  const getPlantCounts = (): Record<string, number> => {
    const counts: Record<string, number> = {};
    state.plants.forEach(p => {
      const plant = PLANTS[p.idx];
      if (plant && !plant.isBlank) {
        counts[plant.name] = (counts[plant.name] || 0) + 1;
      }
    });
    return counts;
  };

  const getGardenArea = (): number => {
    if (state.shape === 'polygon' && state.polyPts.length >= 3) {
      // Shoelace formula for polygon area
      let area = 0;
      const FT = 40; // pixels per foot
      for (let i = 0; i < state.polyPts.length; i++) {
        const j = (i + 1) % state.polyPts.length;
        area += state.polyPts[i].x * state.polyPts[j].y;
        area -= state.polyPts[j].x * state.polyPts[i].y;
      }
      area = Math.abs(area / 2);
      // Convert from pixels to sq ft
      return area / (FT * FT);
    }
    if (state.shape === 'circle') {
      const diameter = Math.min(state.widthFt, state.depthFt);
      return Math.PI * Math.pow(diameter / 2, 2);
    }
    return state.widthFt * state.depthFt;
  };

  const getCoverage = (): number => {
    const FT = 40;
    const gardenAreaSqIn = getGardenArea() * 144;
    let plantAreaSqIn = 0;

    state.plants.forEach(p => {
      const plant = PLANTS[p.idx];
      if (plant) {
        const radiusIn = plant.size / 2;
        plantAreaSqIn += Math.PI * radiusIn * radiusIn;
      }
    });

    return gardenAreaSqIn > 0 ? Math.round((plantAreaSqIn / gardenAreaSqIn) * 100) : 0;
  };

  const getSpeciesCount = (): number => {
    const species = new Set<string>();
    state.plants.forEach(p => {
      const plant = PLANTS[p.idx];
      if (plant && !plant.isBlank) {
        species.add(plant.acr);
      }
    });
    return species.size;
  };

  const getKeystoneCount = (): number => {
    const keystones = new Set<string>();
    state.plants.forEach(p => {
      const plant = PLANTS[p.idx];
      if (plant && plant.isKeystone) {
        keystones.add(plant.acr);
      }
    });
    return keystones.size;
  };

  return (
    <DesignerContext.Provider
      value={{
        state,
        dispatch,
        plants: PLANTS,
        getPlantCounts,
        getGardenArea,
        getCoverage,
        getSpeciesCount,
        getKeystoneCount,
      }}
    >
      {children}
    </DesignerContext.Provider>
  );
}

// Hook
export function useDesigner() {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error('useDesigner must be used within a DesignerProvider');
  }
  return context;
}
