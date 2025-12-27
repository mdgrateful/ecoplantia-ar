'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const BoundaryEditor = dynamic(() => import('@/components/BoundaryEditor'), { ssr: false });

type Step = 'upload' | 'boundary' | 'existing' | 'preferences' | 'generating' | 'results' | 'checkout';

interface DesignState {
  jobId: string | null;
  photoUrl: string | null;
  boundaryPx: { x: number; y: number }[] | null;
  pxPerIn: number | null;
  bedAreaSqft: number | null;
  existingPlants: any[];
  preferences: {
    sun: string;
    style: string;
    heightPref: string;
  } | null;
  palette: any[];
  layout: any[];
  counts: Record<string, number>;
  quote: any | null;
  beautyRenderUrl: string | null;
  tiles: any[];
}

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<DesignState>({
    jobId: null,
    photoUrl: null,
    boundaryPx: null,
    pxPerIn: null,
    bedAreaSqft: null,
    existingPlants: [],
    preferences: null,
    palette: [],
    layout: [],
    counts: {},
    quote: null,
    beautyRenderUrl: null,
    tiles: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Step 1: Create job and upload photo
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Create design job
      const createRes = await fetch('/api/design/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        throw new Error(createData.error || 'Failed to create job');
      }

      const jobId = createData.jobId;
      const uploadUrl = createData.uploadUrl;

      // Upload photo to Supabase Storage using signed URL
      if (uploadUrl) {
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          console.warn('Storage upload failed, continuing with local preview');
        }
      }

      // Create local preview URL
      const localPreviewUrl = URL.createObjectURL(file);

      // Get image dimensions
      const img = new Image();
      img.onload = async () => {
        // Build the public URL for the uploaded photo
        const storagePath = `photos/${jobId}/original.jpg`;
        const publicPhotoUrl = `https://ccjniauqjowpsvibljsz.supabase.co/storage/v1/object/public/design-photos/${storagePath}`;

        // Mark photo as complete with storage URL
        const photoRes = await fetch('/api/design/photo-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            photoUrl: publicPhotoUrl,
            width: img.width,
            height: img.height,
          }),
        });

        const photoData = await photoRes.json();
        if (!photoData.success) {
          throw new Error(photoData.error || 'Failed to save photo info');
        }

        setDesign((prev) => ({
          ...prev,
          jobId,
          photoUrl: localPreviewUrl,
        }));
        setStep('boundary');
        setLoading(false);
      };
      img.onerror = () => {
        setError('Failed to load image');
        setLoading(false);
      };
      img.src = localPreviewUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setLoading(false);
    }
  };


  // Step 2: Set boundary (simplified - using default rectangle for now)
  const handleSetBoundary = async (lengthFt: number, widthFt: number) => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      // Create simple rectangular boundary in pixels (assuming 100px per foot for demo)
      const pxPerFt = 100;
      const boundaryPx = [
        { x: 50, y: 50 },
        { x: 50 + widthFt * pxPerFt, y: 50 },
        { x: 50 + widthFt * pxPerFt, y: 50 + lengthFt * pxPerFt },
        { x: 50, y: 50 + lengthFt * pxPerFt },
      ];

      const res = await fetch('/api/design/boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          boundaryPx,
          scaleMode: 'length_width',
          lengthIn: lengthFt * 12,
          widthIn: widthFt * 12,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to set boundary');
      }

      setDesign((prev) => ({
        ...prev,
        boundaryPx,
        pxPerIn: data.pxPerIn,
        bedAreaSqft: data.bedAreaSqft,
      }));
      setStep('existing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set boundary');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Detect existing plants
  const handleDetectExisting = async () => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/existing/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const data = await res.json();
      if (!data.success) {
        // No existing plants found is OK
        console.log('Detection:', data.error || 'No plants found');
      }

      setDesign((prev) => ({
        ...prev,
        existingPlants: data.suggestions || [],
      }));
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 3b: Save existing plants and continue
  const handleSaveExisting = async () => {
    if (!design.jobId) return;

    setLoading(true);
    try {
      await fetch('/api/design/existing/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          existingPlants: design.existingPlants,
        }),
      });
      setStep('preferences');
    } catch (err) {
      console.error('Save existing error:', err);
      setStep('preferences'); // Continue anyway
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Save preferences
  const handleSavePreferences = async (prefs: { sun: string; style: string; heightPref: string }) => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          ...prefs,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setDesign((prev) => ({ ...prev, preferences: prefs }));
      setStep('generating');

      // Automatically trigger generation
      handleGenerate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      setLoading(false);
    }
  };

  // Step 5: Generate design
  const handleGenerate = async () => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate design');
      }

      setDesign((prev) => ({
        ...prev,
        palette: data.palette,
        layout: data.layout,
        counts: data.counts,
        quote: data.quote,
      }));
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate design');
      setStep('preferences'); // Go back
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Generate beauty render
  const handleBeautyRender = async () => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/beauty-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          season: 'summer',
          timeOfDay: 'midday',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate render');
      }

      setDesign((prev) => ({ ...prev, beautyRenderUrl: data.renderUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate render');
    } finally {
      setLoading(false);
    }
  };

  // Step 7: Generate print tiles
  const handleGenerateTiles = async () => {
    if (!design.jobId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/design/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const data = await res.json();
      if (data.success) {
        setDesign((prev) => ({ ...prev, tiles: data.tiles }));
      }
    } catch (err) {
      console.error('Tile generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 8: Checkout
  const handleCheckout = async () => {
    if (!design.jobId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/design/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError('Failed to create checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="container">
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '10px' }}>
            Ecoplantia
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Photo-to-Rollout Native Garden Designer
          </p>
        </header>

        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {(['upload', 'boundary', 'existing', 'preferences', 'generating', 'results', 'checkout'] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                background: step === s ? 'var(--primary)' : 'var(--border)',
                color: step === s ? 'white' : 'var(--text-secondary)',
                fontSize: '12px',
                textTransform: 'capitalize',
              }}
            >
              {i + 1}. {s}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="card" style={{ background: '#FFEBEE', marginBottom: '20px', color: 'var(--error)' }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: '10px', padding: '4px 8px' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* UPLOAD STEP */}
          {step === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>Upload Your Garden Photo</h2>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Take a photo of the area where you want to plant natives.
              </p>
              <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                <div
                  style={{
                    border: '3px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '60px 40px',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                  <p>{loading ? 'Uploading...' : 'Click to upload or drag and drop'}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>JPG, PNG up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {/* BOUNDARY STEP */}
          {step === 'boundary' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>Set Garden Dimensions</h2>
              {design.photoUrl && (
                <img
                  src={design.photoUrl}
                  alt="Your garden"
                  style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '20px' }}
                />
              )}
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Enter your garden bed dimensions in feet.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const length = parseFloat((form.elements.namedItem('length') as HTMLInputElement).value);
                  const width = parseFloat((form.elements.namedItem('width') as HTMLInputElement).value);
                  handleSetBoundary(length, width);
                }}
                style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}
              >
                <input name="length" type="number" placeholder="Length (ft)" defaultValue="10" min="1" max="100" required style={{ width: '120px' }} />
                <input name="width" type="number" placeholder="Width (ft)" defaultValue="8" min="1" max="100" required style={{ width: '120px' }} />
                <button type="submit" disabled={loading}>
                  {loading ? 'Setting...' : 'Set Dimensions'}
                </button>
              </form>
            </div>
          )}

          {/* EXISTING PLANTS STEP */}
          {step === 'existing' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>Existing Plants</h2>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Area: {design.bedAreaSqft?.toFixed(1)} sq ft
              </p>
              {design.existingPlants.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                  <p>Found {design.existingPlants.length} existing plants to preserve.</p>
                </div>
              ) : (
                <p style={{ marginBottom: '20px' }}>No existing plants detected. We'll design for a fresh start!</p>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={handleDetectExisting} disabled={loading} className="btn-outline">
                  {loading ? 'Detecting...' : '🔍 Detect Plants'}
                </button>
                <button onClick={handleSaveExisting} disabled={loading}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES STEP */}
          {step === 'preferences' && (
            <div>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Your Preferences</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  handleSavePreferences({
                    sun: (form.elements.namedItem('sun') as HTMLSelectElement).value,
                    style: (form.elements.namedItem('style') as HTMLSelectElement).value,
                    heightPref: (form.elements.namedItem('height') as HTMLSelectElement).value,
                  });
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>☀️ Sun Exposure</label>
                  <select name="sun" defaultValue="full_sun" style={{ width: '100%' }}>
                    <option value="full_sun">Full Sun (6+ hours)</option>
                    <option value="part_sun">Part Sun (3-6 hours)</option>
                    <option value="shade">Shade (less than 3 hours)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>🎨 Garden Style</label>
                  <select name="style" defaultValue="pollinator" style={{ width: '100%' }}>
                    <option value="pollinator">Pollinator Paradise (butterflies & bees)</option>
                    <option value="color">Color Focus (maximum blooms)</option>
                    <option value="tidy">Tidy & Structured</option>
                    <option value="low_maint">Low Maintenance</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>📏 Height Preference</label>
                  <select name="height" defaultValue="mixed" style={{ width: '100%' }}>
                    <option value="low">Low (under 2 feet)</option>
                    <option value="mixed">Mixed Heights (natural layers)</option>
                    <option value="tall">Tall (dramatic impact)</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Saving...' : 'Generate My Design →'}
                </button>
              </form>
            </div>
          )}

          {/* GENERATING STEP */}
          {step === 'generating' && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌱</div>
              <h2>Creating Your Garden Design</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Selecting native plants and generating layout...
              </p>
              <div style={{ marginTop: '20px' }}>
                <div className="spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid var(--border)',
                  borderTop: '4px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto',
                }} />
              </div>
            </div>
          )}

          {/* RESULTS STEP */}
          {step === 'results' && (
            <div>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Your Garden Design</h2>

              {/* Beauty Render */}
              {design.beautyRenderUrl ? (
                <img
                  src={design.beautyRenderUrl}
                  alt="Garden visualization"
                  style={{ width: '100%', borderRadius: '12px', marginBottom: '20px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <button onClick={handleBeautyRender} disabled={loading} className="btn-secondary">
                    {loading ? 'Generating...' : '✨ Generate Beauty Render'}
                  </button>
                </div>
              )}

              {/* Plant Palette */}
              <h3 style={{ marginBottom: '10px' }}>Selected Plants ({design.palette.length} species)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
                {design.palette.map((plant: any) => (
                  <div key={plant.sku} style={{ background: 'var(--background)', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>
                    <strong>{plant.name}</strong>
                    {plant.isKeystone && <span style={{ marginLeft: '5px' }}>🦋</span>}
                    {plant.isGrass && <span style={{ marginLeft: '5px' }}>🌾</span>}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      × {design.counts[plant.sku] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quote */}
              {design.quote && (
                <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h3 style={{ marginBottom: '10px' }}>Quote</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>Plants ({Object.values(design.counts).reduce((a, b) => a + b, 0)} total)</span>
                    <span>${design.quote.plants.reduce((sum: number, p: any) => sum + p.lineTotal, 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>{design.quote.sheet.name}</span>
                    <span>${design.quote.sheet.lineTotal.toFixed(2)}</span>
                  </div>
                  <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                    <span>Total</span>
                    <span>${design.quote.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={handleGenerateTiles} disabled={loading} className="btn-outline">
                  🖨️ Generate Print Tiles
                </button>
                <button onClick={handleCheckout} disabled={loading} className="btn-secondary" style={{ flex: 1 }}>
                  Proceed to Checkout →
                </button>
              </div>

              {/* Tiles */}
              {design.tiles.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h3>Print Tiles ({design.tiles.length})</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {design.tiles.map((tile: any) => (
                      <a
                        key={tile.tile}
                        href={tile.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '10px 20px', background: 'var(--background)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text)' }}
                      >
                        Tile {tile.tile} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
