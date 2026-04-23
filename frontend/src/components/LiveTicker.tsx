import React, { useEffect, useRef, useState } from 'react';
import { Transfer } from '../types';

interface Props {
  transfers: Transfer[];
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const LiveTicker: React.FC<Props> = ({ transfers }) => {
  const [flash, setFlash] = useState(false);
  const prevLen = useRef(transfers.length);

  useEffect(() => {
    if (transfers.length > prevLen.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    }
    prevLen.current = transfers.length;
  }, [transfers.length]);

  if (transfers.length === 0) {
    return (
      <div className="ticker-bar ticker-waiting">
        <span className="ticker-label">🔴 CANLI</span>
        <span className="ticker-idle">Ethereum mainnet dinleniyor… ≥100,000,000 USDT transfer bekleniyor</span>
      </div>
    );
  }

  const items = [...transfers, ...transfers]; // döngü için iki kez

  return (
    <div className={`ticker-bar ${flash ? 'ticker-flash' : ''}`}>
      <span className="ticker-label">🔴 CANLI</span>
      <div className="ticker-track-wrap">
        <div className="ticker-track">
          {items.map((t, i) => (
            <a
              key={`${t.id}-${i}`}
              href={`https://etherscan.io/tx/${t.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ticker-item"
            >
              <span className="ticker-whale">🐳</span>
              <span className="ticker-amount">{t.amountFormatted} USDT</span>
              <span className="ticker-arrow">›</span>
              <span className="ticker-addr">{shortAddr(t.from)}</span>
              <span className="ticker-to">→</span>
              <span className="ticker-addr">{shortAddr(t.to)}</span>
              <span className="ticker-sep">│</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTicker;
