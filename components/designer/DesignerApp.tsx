'use client';

import { useState, useEffect } from 'react';
import { DesignerProvider, useDesigner } from '@/lib/designer-context';
import { SavedDesign } from '@/lib/design-storage';
import SetupPanel from './SetupPanel';
import GardenCanvas from './GardenCanvas';
import PlantTray from './PlantTray';
import ControlBar from './ControlBar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import MockupPanel from './MockupPanel';
import SummaryPanel from './SummaryPanel';
import InfoPanel from './InfoPanel';
import WelcomeOverlay from './WelcomeOverlay';
import TutorialDemo from './TutorialDemo';
import PlantDetailPanel from './PlantDetailPanel';
import PlantControls from './PlantControls';
import SaveLoadPanel from './SaveLoadPanel';
import MatrixFillModal from './MatrixFillModal';
import PurchasePanel from './PurchasePanel';
import styles from './Designer.module.css';

function DesignerContent() {
  const { state, dispatch } = useDesigner();
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [detailPlantIdx, setDetailPlantIdx] = useState<number | null>(null);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showMatrixFill, setShowMatrixFill] = useState(false);

  // Check if first time user (could use localStorage in real app)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('ecoplantia-welcome-seen');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
    localStorage.setItem('ecoplantia-welcome-seen', 'true');
    // Show tutorial after welcome for first-time users
    const hasSeenTutorial = localStorage.getItem('ecoplantia-tutorial-seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('ecoplantia-tutorial-seen', 'true');
  };

  const handlePlantSelect = (plantId: string) => {
    setSelectedPlantId(plantId);
  };

  const handlePlantDeselect = () => {
    setSelectedPlantId(null);
  };

  const handleDuplicatePlant = () => {
    if (!selectedPlantId) return;
    const plant = state.plants.find(p => p.id === selectedPlantId);
    if (plant) {
      dispatch({
        type: 'PLACE_PLANT',
        plant: {
          ...plant,
          id: `${Date.now()}-${Math.random()}`,
          cx: plant.cx + 20,
          cy: plant.cy + 20,
        },
      });
    }
  };

  const handleDeletePlant = () => {
    if (!selectedPlantId) return;
    dispatch({ type: 'REMOVE_PLANT', id: selectedPlantId });
    setSelectedPlantId(null);
  };

  const handleShowDetail = (idx: number) => {
    setDetailPlantIdx(idx);
  };

  const handleLoadDesign = (design: SavedDesign) => {
    dispatch({
      type: 'LOAD_DESIGN',
      design: {
        shape: design.shape,
        widthFt: design.widthFt,
        depthFt: design.depthFt,
        polyPts: design.polyPts,
        plants: design.plants,
        photoUrl: design.photoUrl,
        beautyRenderUrl: design.beautyRenderUrl,
      },
    });
    dispatch({ type: 'SHOW_TOAST', message: `Loaded: ${design.name}` });
  };

  return (
    <div className={styles.designer}>
      {/* Welcome Overlay */}
      {showWelcome && <WelcomeOverlay onDismiss={handleWelcomeDismiss} />}

      {/* Tutorial Demo */}
      {showTutorial && state.view === 'design' && (
        <TutorialDemo onComplete={handleTutorialComplete} />
      )}

      <TopBar
        onOpenSaveLoad={() => setShowSaveLoad(true)}
        onOpenMatrixFill={() => setShowMatrixFill(true)}
      />

      <main className={styles.main}>
        {/* Setup Panel - shown first */}
        {state.view === 'setup' && <SetupPanel />}

        {/* Design View */}
        {state.view === 'design' && (
          <div className={styles.designArea}>
            <div className={styles.viewport}>
              <GardenCanvas
                onPlantSelect={handlePlantSelect}
                onPlantDeselect={handlePlantDeselect}
                selectedPlantId={selectedPlantId}
              />
            </div>
            <ControlBar />
            <PlantTray onShowDetail={handleShowDetail} />
            <InfoPanel />
          </div>
        )}

        {/* Mockup View */}
        {state.view === 'mockup' && <MockupPanel />}

        {/* Summary View */}
        {state.view === 'summary' && <SummaryPanel />}

        {/* Purchase View */}
        {state.view === 'purchase' && <PurchasePanel />}
      </main>

      {state.view !== 'setup' && <BottomNav />}

      {/* Plant Controls - shown when plant is selected */}
      {selectedPlantId && state.view === 'design' && (
        <PlantControls
          onDuplicate={handleDuplicatePlant}
          onDelete={handleDeletePlant}
          onDeselect={handlePlantDeselect}
        />
      )}

      {/* Plant Detail Panel */}
      <PlantDetailPanel
        plantIdx={detailPlantIdx}
        onClose={() => setDetailPlantIdx(null)}
      />

      {/* Toast Notification */}
      {state.toast && (
        <div className={styles.toast}>
          {state.toast}
        </div>
      )}

      {/* Save/Load Modal */}
      <SaveLoadPanel
        isOpen={showSaveLoad}
        onClose={() => setShowSaveLoad(false)}
        onLoad={handleLoadDesign}
      />

      {/* Matrix Fill Modal */}
      <MatrixFillModal
        isOpen={showMatrixFill}
        onClose={() => setShowMatrixFill(false)}
      />
    </div>
  );
}

export default function DesignerApp() {
  return (
    <DesignerProvider>
      <DesignerContent />
    </DesignerProvider>
  );
}
