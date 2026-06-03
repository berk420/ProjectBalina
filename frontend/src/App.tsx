import React, { useEffect, useState, useCallback } from 'react';
import { Transfer } from './types';
import { getRecentTransfers, checkHealth } from './services/api';
import TransferCard from './components/TransferCard';
import TelegramJoin from './components/TelegramJoin';
import LiveTicker from './components/LiveTicker';
import TransferChart from './components/TransferChart';
import './App.css';

const App: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const loadTransfers = useCallback(async () => {
    const data = await getRecentTransfers(20);
    setTransfers(prev => {
      const prevIds = new Set(prev.map(t => t.id));
      const incoming = data.filter((t: Transfer) => !prevIds.has(t.id));
      if (incoming.length > 0) {
        const ids = new Set<string>(incoming.map((t: Transfer) => t.id));
        setNewIds(ids);
        setTimeout(() => setNewIds(new Set()), 3000);
      }
      return data;
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransfers();
    const interval = setInterval(loadTransfers, 8000);
    return () => clearInterval(interval);
  }, [loadTransfers]);

  useEffect(() => {
    const ping = async () => setBackendOnline(await checkHealth());
    ping();
    const interval = setInterval(ping, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">

      {/* ── Canlı Ticker ── */}
      <LiveTicker transfers={transfers} />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          <span className="logo">🐳</span>
          <div>
            <h1>Balina Takip</h1>
            <p className="subtitle">USDT Büyük Transfer Bildirimleri</p>
          </div>
        </div>
        <div className="header-right">
          <div className="status-bar">
            {backendOnline === true  && <span className="status-dot green"  title="Backend çalışıyor">● API</span>}
            {backendOnline === false && <span className="status-dot red"    title="Backend çevrimdışı">● API</span>}
            {backendOnline === null  && <span className="status-dot yellow" title="Backend kontrol ediliyor">● API</span>}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">≥100.000</span>
            <span className="stat-label">USDT Eşiği</span>
          </div>
        </div>

        <TelegramJoin />

        <div className="transfers-section">
          <h2>Son Büyük Transferler</h2>
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Transferler yükleniyor...</p>
            </div>
          ) : transfers.length === 0 ? (
            <div className="empty-state">
              <p>🔍 Henüz 100.000 USDT üzerinde transfer tespit edilmedi.</p>
              <p>Ethereum mainnet dinleniyor...</p>
            </div>
          ) : (
            <div className="transfers-grid">
              {transfers.map((t) => (
                <TransferCard key={t.id} transfer={t} isNew={newIds.has(t.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Ethereum Mainnet • USDT Contract:{' '}
          <a href="https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7"
             target="_blank" rel="noopener noreferrer">
            0xdAC17F...ec7
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;
