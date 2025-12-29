const fs = require('fs');

const newContent = `'use client';

import { useState, useRef } from 'react';

type Step = 'upload' | 'dimensions' | 'preferences' | 'generating' | 'results';

interface DesignState {
  jobId: string | null;
  photoUrl: string | null;
  lengthFt: number;
  widthFt: number;
  bedAreaSqft: number | null;
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
}

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [design, setDesign] = useState<DesignState>({
    jobId: null,
    photoUrl: null,
    lengthFt: 10,
    widthFt: 8,
    bedAreaSqft: null,
    preferences: null,
    palette: [],
    layout: [],
    counts: {},
    quote: null,
    beautyRenderUrl: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Upload photo and create job
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
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

      if (uploadUrl) {
        await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      }

      const localPreviewUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = async () => {
        const storagePath = \`photos/\${jobId}/original.jpg\`;
        const publicPhotoUrl = \`https://ccjniauqjowpsvibljsz.supabase.co/storage/v1/object/public/design-photos/\${storagePath}\`;

        await fetch('/api/design/photo-complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId,
            photoUrl: publicPhotoUrl,
            width: img.width,
            height: img.height,
          }),
        });

        setDesign((prev) => ({ ...prev, jobId, photoUrl: localPreviewUrl }));
        setStep('dimensions');
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

  // Step 2: Set dimensions and save boundary
  const handleSetDimensions = async (lengthFt: number, widthFt: number) => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const bedAreaSqft = lengthFt * widthFt;
      const pxPerIn = 10; // Default scale for AI generation

      // Create simple rectangular boundary
      const boundaryPx = [
        { x: 0, y: 0 },
        { x: widthFt * 12 * pxPerIn, y: 0 },
        { x: widthFt * 12 * pxPerIn, y: lengthFt * 12 * pxPerIn },
        { x: 0, y: lengthFt * 12 * pxPerIn },
      ];

      const res = await fetch('/api/design/boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          boundaryPx,
          pxPerIn,
          scaleMode: 'dimensions',
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to set dimensions');
      }

      setDesign((prev) => ({
        ...prev,
        lengthFt,
        widthFt,
        bedAreaSqft: data.bedAreaSqft || bedAreaSqft,
      }));
      setStep('preferences');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set dimensions');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save preferences and generate
  const handleSavePreferences = async (prefs: { sun: string; style: string; heightPref: string }) => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      await fetch('/api/design/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId, ...prefs }),
      });

      setDesign((prev) => ({ ...prev, preferences: prefs }));
      setStep('generating');

      // Generate design
      const genRes = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const genData = await genRes.json();
      if (!genData.success) {
        throw new Error(genData.error || 'Failed to generate design');
      }

      setDesign((prev) => ({
        ...prev,
        palette: genData.palette,
        layout: genData.layout,
        counts: genData.counts,
        quote: genData.quote,
      }));

      // Auto-generate beauty render
      const renderRes = await fetch('/api/design/beauty-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const renderData = await renderRes.json();
      if (renderData.success) {
        const renderUrl = renderData.renderUrl || (renderData.b64_png ? \`data:image/png;base64,\${renderData.b64_png}\` : null);
        setDesign((prev) => ({ ...prev, beautyRenderUrl: renderUrl }));
      }

      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setStep('preferences');
    } finally {
      setLoading(false);
    }
  };

  // Checkout
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

  // Regenerate design
  const handleRegenerate = async () => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);
    setStep('generating');

    try {
      const genRes = await fetch('/api/design/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const genData = await genRes.json();
      if (!genData.success) throw new Error(genData.error);

      setDesign((prev) => ({
        ...prev,
        palette: genData.palette,
        layout: genData.layout,
        counts: genData.counts,
        quote: genData.quote,
        beautyRenderUrl: null,
      }));

      // Generate new beauty render
      const renderRes = await fetch('/api/design/beauty-render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: design.jobId }),
      });

      const renderData = await renderRes.json();
      if (renderData.success) {
        const renderUrl = renderData.renderUrl || (renderData.b64_png ? \`data:image/png;base64,\${renderData.b64_png}\` : null);
        setDesign((prev) => ({ ...prev, beautyRenderUrl: renderUrl }));
      }

      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed');
      setStep('results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>
      <div className="container">
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '10px' }}>
            🌿 Ecoplantia AI
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Instant Native Garden Design from Your Photo
          </p>
        </header>

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          {(['upload', 'dimensions', 'preferences', 'generating', 'results'] as Step[]).map((s, i) => (
            <div
              key={s}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: step === s ? 'var(--primary)' : s === 'generating' ? '#FFF3E0' : 'white',
                color: step === s ? 'white' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: step === s ? '600' : '400',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </div>
          ))}
        </div>

        {error && (
          <div className="card" style={{ background: '#FFEBEE', marginBottom: '20px', color: 'var(--error)', maxWidth: '600px', margin: '0 auto 20px' }}>
            {error}
            <button onClick={() => setError(null)} style={{ marginLeft: '10px', padding: '4px 8px' }}>×</button>
          </div>
        )}

        <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>

          {/* UPLOAD */}
          {step === 'upload' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>📷 Upload Your Garden Photo</h2>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Snap a photo of where you want to plant natives. Our AI will create a custom design!
              </p>
              <label htmlFor="photo-upload" style={{ cursor: 'pointer' }}>
                <div style={{
                  border: '3px dashed var(--primary)',
                  borderRadius: '16px',
                  padding: '60px 40px',
                  background: 'rgba(76, 175, 80, 0.05)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '15px' }}>🏡</div>
                  <p style={{ fontSize: '18px', fontWeight: '500' }}>{loading ? 'Uploading...' : 'Click to upload your photo'}</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>JPG, PNG up to 10MB</p>
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

          {/* DIMENSIONS */}
          {step === 'dimensions' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '20px' }}>📐 Garden Bed Size</h2>
              {design.photoUrl && (
                <img
                  src={design.photoUrl}
                  alt="Your garden"
                  style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
              )}
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Enter the approximate size of your planting area.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const length = parseFloat((form.elements.namedItem('length') as HTMLInputElement).value);
                  const width = parseFloat((form.elements.namedItem('width') as HTMLInputElement).value);
                  handleSetDimensions(length, width);
                }}
                style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Length</label>
                  <input name="length" type="number" defaultValue="10" min="3" max="100" required style={{ width: '100px', textAlign: 'center', fontSize: '18px' }} />
                  <span style={{ marginLeft: '8px' }}>ft</span>
                </div>
                <div style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>×</div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Width</label>
                  <input name="width" type="number" defaultValue="8" min="3" max="100" required style={{ width: '100px', textAlign: 'center', fontSize: '18px' }} />
                  <span style={{ marginLeft: '8px' }}>ft</span>
                </div>
                <button type="submit" disabled={loading} style={{ marginTop: '20px', width: '100%', maxWidth: '300px' }}>
                  {loading ? 'Setting...' : 'Continue →'}
                </button>
              </form>
            </div>
          )}

          {/* PREFERENCES */}
          {step === 'preferences' && (
            <div>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🎨 Your Garden Style</h2>
              <p style={{ textAlign: 'center', marginBottom: '25px', color: 'var(--text-secondary)' }}>
                Area: <strong>{design.bedAreaSqft || (design.lengthFt * design.widthFt)} sq ft</strong>
              </p>
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
                    <option value="full_sun">Full Sun (6+ hours direct sunlight)</option>
                    <option value="part_sun">Part Sun/Shade (3-6 hours)</option>
                    <option value="shade">Shade (less than 3 hours)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>🦋 Garden Goal</label>
                  <select name="style" defaultValue="pollinator" style={{ width: '100%' }}>
                    <option value="pollinator">Pollinator Paradise - Attract butterflies & bees</option>
                    <option value="color">Maximum Color - Season-long blooms</option>
                    <option value="low_maint">Low Maintenance - Easy care natives</option>
                    <option value="tidy">Tidy & Formal - Structured look</option>
                  </select>
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>📏 Plant Heights</label>
                  <select name="height" defaultValue="mixed" style={{ width: '100%' }}>
                    <option value="low">Low Profile - Under 2 feet</option>
                    <option value="mixed">Natural Layers - Mixed heights</option>
                    <option value="tall">Dramatic - Tall statement plants</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', fontSize: '18px', padding: '15px' }}>
                  {loading ? 'Generating...' : '✨ Generate My Garden Design'}
                </button>
              </form>
            </div>
          )}

          {/* GENERATING */}
          {step === 'generating' && (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🌱</div>
              <h2 style={{ marginBottom: '15px' }}>Creating Your Garden...</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                Our AI is selecting the perfect native plants and creating a beautiful visualization.
              </p>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid var(--border)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }} />
              <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                This may take 30-60 seconds...
              </p>
            </div>
          )}

          {/* RESULTS */}
          {step === 'results' && (
            <div>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>🎉 Your Garden Design</h2>

              {/* Beauty Render */}
              {design.beautyRenderUrl ? (
                <div style={{ marginBottom: '25px' }}>
                  <img
                    src={design.beautyRenderUrl}
                    alt="AI Garden Visualization"
                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  />
                  <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    AI-generated visualization of your native garden
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--background)', borderRadius: '12px', marginBottom: '25px' }}>
                  <p>Beauty render generating...</p>
                </div>
              )}

              {/* Plant Palette */}
              <h3 style={{ marginBottom: '15px' }}>🌿 Selected Plants ({design.palette.length} species)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '25px' }}>
                {design.palette.map((plant: any) => (
                  <div key={plant.sku} style={{
                    background: 'var(--background)',
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{plant.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {plant.isKeystone && '🦋 '}
                      {plant.isGrass && '🌾 '}
                      × {design.counts[plant.sku] || 0}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quote */}
              {design.quote && (
                <div style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                  <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>💰 Your Quote</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Plants ({Object.values(design.counts).reduce((a: number, b: number) => a + b, 0)} total)</span>
                    <span>\${design.quote.plants.reduce((sum: number, p: any) => sum + p.lineTotal, 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span>{design.quote.sheet?.name || 'Rollout Sheet'}</span>
                    <span>\${(design.quote.sheet?.lineTotal || 0).toFixed(2)}</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '2px solid rgba(0,0,0,0.1)', margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '20px' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary)' }}>\${design.quote.total.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={handleRegenerate} disabled={loading} className="btn-outline" style={{ flex: 1 }}>
                  🔄 Regenerate
                </button>
                <button onClick={handleCheckout} disabled={loading} style={{ flex: 2, fontSize: '16px' }}>
                  🛒 Order Plants →
                </button>
              </div>
            </div>
          )}
        </div>

        <footer style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          <p>Powered by AI • Native plants for a healthier ecosystem</p>
        </footer>
      </div>

      <style jsx>{\`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      \`}</style>
    </main>
  );
}
`;

fs.writeFileSync('app/page.tsx', newContent);
console.log('App simplified to focus on AI generation!');
