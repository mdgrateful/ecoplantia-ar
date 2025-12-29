'use client';

import { useDesigner, ViewMode } from '@/lib/designer-context';
import styles from './Designer.module.css';

interface NavItem {
  view: ViewMode;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'design', icon: '🎨', label: 'Design' },
  { view: 'mockup', icon: '📷', label: 'Mockup' },
  { view: 'summary', icon: '📊', label: 'Summary' },
  { view: 'purchase', icon: '🛒', label: 'Purchase' },
];

export default function BottomNav() {
  const { state, dispatch } = useDesigner();

  const handleNavClick = (view: ViewMode) => {
    dispatch({ type: 'SET_VIEW', view });
  };

  return (
    <nav className={styles.bottomBar}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.view}
          className={`${styles.navBtn} ${state.view === item.view ? styles.active : ''}`}
          onClick={() => handleNavClick(item.view)}
        >
          <span style={{ fontSize: '16px' }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
