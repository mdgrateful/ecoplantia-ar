const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace handler
const oldHandler = `  // Step 2: Set boundary (simplified - using default rectangle for now)
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
  };`;

const newHandler = `  // Step 2: Handle boundary completion from interactive editor
  const handleBoundaryComplete = async (data: {
    boundaryPx: { x: number; y: number }[];
    pxPerIn: number;
    bedAreaSqft: number;
  }) => {
    if (!design.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/design/boundary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: design.jobId,
          boundaryPx: data.boundaryPx,
          scaleMode: 'two_point',
          pxPerIn: data.pxPerIn,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to set boundary');
      }

      setDesign((prev) => ({
        ...prev,
        boundaryPx: data.boundaryPx,
        pxPerIn: data.pxPerIn,
        bedAreaSqft: data.bedAreaSqft,
      }));
      setStep('existing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set boundary');
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(oldHandler, newHandler);

// Replace UI
const oldUI = `          {/* BOUNDARY STEP */}
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
          )}`;

const newUI = `          {/* BOUNDARY STEP - Interactive Editor */}
          {step === 'boundary' && design.photoUrl && (
            <div>
              <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Trace Your Garden Bed</h2>
              <BoundaryEditor
                photoUrl={design.photoUrl}
                onComplete={handleBoundaryComplete}
                onCancel={() => setStep('upload')}
              />
              {loading && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p>Saving boundary...</p>
                </div>
              )}
            </div>
          )}`;

content = content.replace(oldUI, newUI);

fs.writeFileSync('app/page.tsx', content);
console.log('Page updated successfully');
