import React, { useEffect, useRef } from 'react';
import { Transfer } from '../types';

interface Props {
  transfer: Transfer;
  isNew?: boolean;
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `${diff}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}sa önce`;
  return new Date(timestamp).toLocaleDateString('tr-TR');
}

function sizeClass(amountFormatted: string): string {
  const num = parseFloat(amountFormatted.replace(/,/g, ''));
  if (num >= 500_000_000) return 'tc-mega';
  if (num >= 100_000_000) return 'tc-huge';
  if (num >= 50_000_000)  return 'tc-large';
  return 'tc-normal';
}

function whaleEmoji(amountFormatted: string): string {
  const num = parseFloat(amountFormatted.replace(/,/g, ''));
  if (num >= 500_000_000) return '🚨';
  if (num >= 100_000_000) return '🐋';
  if (num >= 50_000_000)  return '🐳';
  return '🐳';
}

const TransferCard: React.FC<Props> = ({ transfer, isNew }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew && ref.current) {
      ref.current.classList.add('tc-flash');
      setTimeout(() => ref.current?.classList.remove('tc-flash'), 1200);
    }
  }, [isNew]);

  const size = sizeClass(transfer.amountFormatted);

  return (
    <div ref={ref} className={`transfer-card ${size}`}>

      {/* Üst band — miktar */}
      <div className="tc-top">
        <div className="tc-left">
          <span className="tc-emoji">{whaleEmoji(transfer.amountFormatted)}</span>
          <div>
            <div className="tc-amount">{transfer.amountFormatted}</div>
            <div className="tc-currency">USDT</div>
          </div>
        </div>
        <div className="tc-right">
          {isNew && <span className="tc-new-badge">YENİ</span>}
          <span className="tc-time">{timeAgo(transfer.timestamp)}</span>
          <a
            href={`https://etherscan.io/tx/${transfer.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tc-etherscan"
            title="Etherscan'da Gör"
          >
            ↗
          </a>
        </div>
      </div>

      {/* Akış: gönderen → alıcı */}
      <div className="tc-flow">
        <div className="tc-addr-block">
          <span className="tc-addr-label">GÖNDEREN</span>
          <a href={`https://etherscan.io/address/${transfer.from}`} target="_blank" rel="noopener noreferrer" className="tc-addr">
            {shortAddr(transfer.from)}
          </a>
        </div>
        <div className="tc-arrow">→</div>
        <div className="tc-addr-block">
          <span className="tc-addr-label">ALICI</span>
          <a href={`https://etherscan.io/address/${transfer.to}`} target="_blank" rel="noopener noreferrer" className="tc-addr">
            {shortAddr(transfer.to)}
          </a>
        </div>
      </div>

      {/* TX */}
      <div className="tc-tx">
        <span className="tc-tx-label">TX</span>
        <a href={`https://etherscan.io/tx/${transfer.txHash}`} target="_blank" rel="noopener noreferrer" className="tc-tx-hash">
          {transfer.txHash && transfer.txHash !== 'unknown' ? transfer.txHash.slice(0, 20) + '...' : '—'}
        </a>
      </div>

    </div>
  );
};

export default TransferCard;
