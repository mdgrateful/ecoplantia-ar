import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ecoplantia - Photo-to-Rollout Garden Designer',
  description: 'Transform your outdoor space with native plants. Upload a photo, trace your garden boundary, and get a custom planting layout.',
  keywords: ['native plants', 'garden design', 'landscape', 'AR garden', 'plant layout'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
