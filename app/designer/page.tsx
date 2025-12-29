'use client';

import dynamic from 'next/dynamic';

const DesignerApp = dynamic(() => import('@/components/designer/DesignerApp'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f5f5f5',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
        <div style={{ fontSize: '18px', color: '#1B9E31', fontWeight: 'bold' }}>
          Loading Designer...
        </div>
      </div>
    </div>
  ),
});

export default function DesignerPage() {
  return <DesignerApp />;
}
