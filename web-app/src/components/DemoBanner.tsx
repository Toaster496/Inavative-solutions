import React from 'react';
import { Icon } from './ui/Icon';

export const DemoBanner: React.FC = () => {
  const [dismissed, setDismissed] = React.useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d)',
        borderBottom: '1px solid #fca5a5',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        position: 'relative',
        zIndex: 9999,
        flexWrap: 'wrap',
      }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#fef2f2',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          background: 'rgba(255,255,255,0.1)',
          padding: '2px 8px',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        DEMO
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: 11,
          color: '#fecaca',
          textAlign: 'center',
        }}
      >
        This is a demonstration environment. All data is simulated. No real blockchain transactions occur.
      </span>
      <span
        className="font-mono"
        style={{
          fontSize: 9,
          color: '#fca5a5',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderLeft: '1px solid rgba(255,255,255,0.15)',
          paddingLeft: 12,
        }}
      >
        SSH: ssh demo@localhost -p 2222
      </span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fecaca',
          cursor: 'pointer',
          padding: '2px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}
        title="Dismiss"
      >
        <Icon name="close" size={12} />
      </button>
    </div>
  );
};

export default DemoBanner;
